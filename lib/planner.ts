export type Constraints = { budget: number; dinners: number; collegeDays: number; fare: number; buffer: number; diet: 'vegetarian' | 'vegan' | 'any'; location: string; endDate: string; maxWalk: number; optionalMeal: boolean };
export const defaults: Constraints = { budget:45, dinners:6, collegeDays:3, fare:1.5, buffer:2, diet:'vegetarian', location:'DCU, Glasnevin', endDate:'Friday', maxWalk:20, optionalMeal:false };
export const money = (cents:number) => new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(cents/100);
const products = [
 {id:'rice',name:'Long-grain rice',pack:'1 kg',size:1000,price:149},
 {id:'pasta',name:'Dried pasta',pack:'500 g',size:500,price:95},
 {id:'lentils',name:'Red lentils',pack:'500 g',size:500,price:165},
 {id:'chickpeas',name:'Chickpeas',pack:'400 g tin · 240 g drained',size:240,price:79},
 {id:'tomatoes',name:'Chopped tomatoes',pack:'400 g tin',size:400,price:75},
 {id:'veg',name:'Frozen mixed vegetables',pack:'1 kg',size:1000,price:169},
 {id:'coconut',name:'Coconut milk',pack:'400 ml',size:400,price:125},
 {id:'oil',name:'Vegetable oil',pack:'500 ml',size:500,price:199},
 {id:'spice',name:'Curry powder',pack:'40 g',size:40,price:99},
 {id:'beans',name:'Kidney beans',pack:'400 g tin · 240 g drained',size:240,price:79},
];
const recipes = [
 {name:'Red lentil tomato pasta',minutes:25,ingredients:{pasta:100,lentils:70,tomatoes:200,veg:100,oil:10}},
 {name:'Chickpea & vegetable curry',minutes:25,ingredients:{rice:100,chickpeas:120,tomatoes:100,veg:150,coconut:100,oil:10,spice:5}},
 {name:'Smoky bean rice bowl',minutes:20,ingredients:{rice:100,beans:120,tomatoes:150,veg:150,oil:10,spice:5}},
];
export function validate(raw:unknown): Constraints {
 if(!raw || typeof raw !== 'object') throw Error('Please check your plan details.');
 const x=raw as Record<string,unknown>;
 const number=(k:string,min:number,max:number,integer=false)=>{const v=x[k];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw Error(`Check ${k}: use ${min}–${max}${integer?' whole':''}.`);return v;};
 if(!['vegetarian','vegan','any'].includes(String(x.diet)))throw Error('Choose a dietary preference.');
 return {budget:number('budget',0,1000),dinners:number('dinners',1,14,true),collegeDays:number('collegeDays',0,14,true),fare:number('fare',0,20),buffer:number('buffer',0,1000),maxWalk:number('maxWalk',0,60,true),diet:x.diet as Constraints['diet'],location:String(x.location||'Dublin').slice(0,80),endDate:String(x.endDate||'end of plan').slice(0,40),optionalMeal:x.optionalMeal===true};
}
export function optimise(c:Constraints){
 const budget=Math.round(c.budget*100),transport=c.collegeDays*2*Math.round(c.fare*100),reserve=Math.round(c.buffer*100);
 const candidates=[];
 for(const shop of [{name:'Nearby shop',walk:5,multiplier:1.2},{name:'Value shop',walk:18,multiplier:1}]){
 if(shop.walk>c.maxWalk)continue;
 for(const style of ['simple','variety']){
 const dinners=Array.from({length:c.dinners},(_,i)=>recipes[style==='simple'?i%2:i%3]);
 const need:Record<string,number>={};for(const recipe of dinners)for(const [id,q]of Object.entries(recipe.ingredients))need[id]=(need[id]||0)+q;
 const basket=products.filter(p=>need[p.id]).map(p=>({...p,quantity:Math.ceil(need[p.id]/p.size),unitPrice:Math.round(p.price*shop.multiplier)})).map(p=>({...p,total:p.quantity*p.unitPrice}));
 const groceries=basket.reduce((s,p)=>s+p.total,0),meal=c.optionalMeal?500:0,total=transport+groceries+meal;
 candidates.push({id:`${shop.name}-${style}`,shop:shop.name,walk:shop.walk,style,groceries,transport,meal,total,remaining:budget-total,reserve,basket,dinners:dinners.map((d,i)=>({day:i+1,name:d.name,minutes:d.minutes})),feasible:total+reserve<=budget,score:total+shop.walk*8+(style==='simple'?60:0)});
 }
 }
 candidates.sort((a,b)=>a.score-b.score);
 const feasible=candidates.filter(p=>p.feasible);
 return {constraints:c,plans:feasible,cheapest:candidates.toSorted((a,b)=>a.total-b.total)[0]||null,shortfall:feasible.length?0:Math.max(0,(candidates.toSorted((a,b)=>a.total-b.total)[0]?.total??0)+reserve-budget),evaluated:candidates.length,notice:'Illustrative prototype prices and walking times. Confirm prices, stock, routes and fare eligibility before spending. Covers dinners only; not a full daily food budget.'};
}
