import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults, optimise, validate} from '../lib/planner.ts';
test('feasible candidates reserve travel, cover dinners and reconcile exact cents',()=>{
 for(let budget=0;budget<=70;budget+=2.5)for(let dinners=1;dinners<=14;dinners++){
 const c={...defaults,budget,dinners};const result=optimise(c);
 for(const p of result.plans){assert.equal(p.dinners.length,dinners);assert.equal(p.transport,900);assert.equal(p.groceries,p.basket.reduce((s,x)=>s+x.total,0));assert.ok(p.total+p.reserve<=Math.round(budget*100));assert.equal(p.total+p.remaining,Math.round(budget*100));assert.ok(p.basket.every(x=>Number.isInteger(x.quantity)&&x.quantity>0));}
 }
});
test('unaffordable request is explicitly infeasible',()=>{const r=optimise({...defaults,budget:1});assert.equal(r.plans.length,0);assert.ok(r.shortfall>0);});
test('walking constraint is hard, optional allowance and return fares counted',()=>{const r=optimise({...defaults,maxWalk:5,optionalMeal:true});assert.ok(r.plans.every(p=>p.walk<=5&&p.meal===500));assert.equal(optimise({...defaults,maxWalk:0}).plans.length,0);});
test('reject invalid numbers, fractional counts and invalid diets',()=>{for(const patch of [{budget:NaN},{budget:-1},{dinners:2.5},{collegeDays:Infinity},{dinners:15},{fare:-1},{diet:'keto'}])assert.throws(()=>validate({...defaults,...patch}));assert.deepEqual(validate(defaults),defaults);});

test('all diets and every exclusion combination are enforced in every plan',async()=>{
 const {eligibleRecipes,products,diets,exclusionOptions}=await import('../lib/planner.ts');
 for(const diet of Object.keys(diets) as (keyof typeof diets)[])for(let mask=0;mask<16;mask++){
 const exclusions=exclusionOptions.filter((_,i)=>mask&(1<<i));const c={...defaults,diet,exclusions,budget:200};
 const allowed=eligibleRecipes(c).map(r=>r.id);const r=optimise(c);assert.ok(r.plans.length>0);
 for(const p of r.plans)for(const d of p.dinners){assert.ok(allowed.includes(d.id));if(diet==='vegan')assert.equal(d.kind,'vegan');if(diet==='vegetarian')assert.ok(['vegan','vegetarian'].includes(d.kind));if(diet==='pescatarian')assert.notEqual(d.kind,'meat');for(const id of Object.keys(d.ingredients)){const product=products.find(p=>p.id===id)!;assert.ok(!product.allergens.some(a=>exclusions.includes(a)));}}
 }
 assert.throws(()=>validate({...defaults,exclusions:['peanuts']}));
});
test('nutrition uses edible weights and retains missing fibre',async()=>{
 const {nutritionFor,recipes}=await import('../lib/planner.ts');
 const eggs=nutritionFor(recipes.find(r=>r.id==='egg-rice')!);
 // 75g dry rice + 100g edible egg + 150g peas + 4.6g oil.
 assert.equal(eggs.kcal,541);assert.equal(eggs.protein,25.6);assert.equal(eggs.fibre,8.8);
 assert.equal(nutritionFor(recipes.find(r=>r.id==='curry')!).fibre,null);
 assert.equal(nutritionFor(recipes.find(r=>r.id==='lentil-pasta')!).kcal,597);
});
test('diet changes available variety without claiming all vegetarian meals are vegan',()=>{
 const vegan=optimise({...defaults,diet:'vegan'}).plans.find(p=>p.style==='variety')!;
 const vegetarian=optimise(defaults).plans.find(p=>p.style==='variety')!;
 assert.notDeepEqual(vegan.dinners.map(d=>d.id),vegetarian.dinners.map(d=>d.id));
 assert.ok(vegetarian.dinners.some(d=>d.kind==='vegetarian'));
});


import { allowedOrigin } from '../lib/request-origin.ts';
test('origin validation supports public hosts behind Next proxy and rejects foreign origins',()=>{
 assert.equal(allowedOrigin(new Request('http://localhost:3000/api/plan',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})),true);
 assert.equal(allowedOrigin(new Request('http://localhost:3000/api/plan',{headers:{host:'dublinsaver.vercel.app',origin:'https://dublinsaver.vercel.app'}})),true);
 assert.equal(allowedOrigin(new Request('http://localhost:3000/api/plan',{headers:{host:'dublinsaver.vercel.app',origin:'https://other.example'}})),false);
 assert.equal(allowedOrigin(new Request('http://localhost:3000/api/plan',{headers:{origin:'null'}})),false);
});


import {restoreSession} from '../lib/plan-session.ts';
test('refresh restores applied preferences, alternative and checked items without trusting saved totals',()=>{
 const applied={...defaults,diet:'vegan' as const,exclusions:['gluten' as const]};
 const result=optimise(applied),alternative=result.plans[1];
 const saved=restoreSession(JSON.stringify({version:1,applied,draft:{...applied,budget:50},selectedId:alternative.id,checked:[alternative.basket[0].id,alternative.basket[0].id,'unknown'],hasPlan:true,total:0}));
 assert.ok(saved);assert.equal(saved.hasPlan,true);assert.equal(saved.dirty,true);assert.equal(saved.draft.budget,50);assert.equal(saved.result.constraints.budget,45);assert.equal(saved.result.plans[saved.selected].id,alternative.id);assert.deepEqual(saved.checked,[alternative.basket[0].id]);assert.equal(saved.result.plans[saved.selected].total,alternative.total);
});
test('session restoration handles corrupt, obsolete, invalid and unaffordable plans',()=>{
 for(const raw of [null,'{','null',JSON.stringify({version:2}),JSON.stringify({version:1,applied:{...defaults,diet:'invalid'}})])assert.equal(restoreSession(raw),null);
 const saved=restoreSession(JSON.stringify({version:1,applied:{...defaults,budget:0},draft:{...defaults,dinners:99},hasPlan:true,selectedId:'missing',checked:['rice']}));
 assert.ok(saved);assert.equal(saved.result.plans.length,0);assert.equal(saved.draft.budget,0);assert.equal(saved.dirty,false);assert.deepEqual(saved.checked,[]);
});
