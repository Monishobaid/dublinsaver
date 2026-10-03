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
