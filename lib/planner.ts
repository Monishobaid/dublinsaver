import nutrients from '../data/nutrients.json' with { type: 'json' };
export const diets = {vegetarian:'Vegetarian',vegan:'Vegan',pescatarian:'Pescatarian',any:'No preference'};
export const exclusionOptions = ['gluten','milk','eggs','fish'] as const;
export type Exclusion = typeof exclusionOptions[number];
export type Constraints = { budget: number; dinners: number; collegeDays: number; fare: number; buffer: number; diet: keyof typeof diets; exclusions: Exclusion[]; location: string; endDate: string; maxWalk: number; optionalMeal: boolean };
export const defaults: Constraints = { budget:45, dinners:6, collegeDays:3, fare:1.5, buffer:2, diet:'vegetarian', exclusions:[], location:'DCU, Glasnevin', endDate:'Friday', maxWalk:20, optionalMeal:false };
export const money = (cents:number) => new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(cents/100);
type FoodId=keyof typeof nutrients;
type Product={id:FoodId;name:string;pack:string;size:number;price:number;allergens:Exclusion[];gramsPerUnit:number};
export const products:Product[] = [
 {id:'rice',name:'Long-grain rice',pack:'1 kg',size:1000,price:149,allergens:[],gramsPerUnit:1},
 {id:'pasta',name:'Wholewheat pasta',pack:'500 g',size:500,price:119,allergens:['gluten'],gramsPerUnit:1},
 {id:'lentils',name:'Red lentils',pack:'500 g',size:500,price:165,allergens:[],gramsPerUnit:1},
 {id:'chickpeas',name:'Chickpeas',pack:'400 g tin · 240 g drained',size:240,price:79,allergens:[],gramsPerUnit:1},
 {id:'tomatoes',name:'Chopped tomatoes',pack:'400 g tin',size:400,price:75,allergens:[],gramsPerUnit:1},
 {id:'veg',name:'Frozen peas',pack:'1 kg',size:1000,price:169,allergens:[],gramsPerUnit:1},
 {id:'coconut',name:'Coconut milk',pack:'400 ml',size:400,price:125,allergens:[],gramsPerUnit:1},
 {id:'oil',name:'Sunflower oil',pack:'500 ml',size:500,price:199,allergens:[],gramsPerUnit:.92},
 {id:'spice',name:'Curry powder (check label)',pack:'40 g',size:40,price:99,allergens:['gluten','milk','eggs','fish'],gramsPerUnit:1},
 {id:'beans',name:'Kidney beans',pack:'400 g tin · 240 g drained',size:240,price:79,allergens:[],gramsPerUnit:1},
 {id:'eggs',name:'Eggs',pack:'6 eggs',size:6,price:199,allergens:['eggs'],gramsPerUnit:50},
 {id:'cheese',name:'Vegetarian cheddar',pack:'200 g',size:200,price:219,allergens:['milk'],gramsPerUnit:1},
 {id:'tuna',name:'Tuna in brine',pack:'145 g tin · 102 g drained',size:102,price:119,allergens:['fish'],gramsPerUnit:1},
 {id:'chicken',name:'Chicken breast',pack:'300 g',size:300,price:349,allergens:[],gramsPerUnit:1},
];
export type Recipe={id:string;name:string;minutes:number;kind:'vegan'|'vegetarian'|'fish'|'meat';ingredients:Partial<Record<FoodId,number>>;method:string};
export const recipes:Recipe[] = [
 {id:'lentil-pasta',name:'Tomato & lentil pasta',minutes:25,kind:'vegan',ingredients:{pasta:80,lentils:60,tomatoes:200,veg:100,oil:5},method:'Cook the pasta according to its packet. Simmer lentils in water until tender, then add tomatoes and peas. Stir in the oil and combine with the drained pasta.'},
 {id:'curry',name:'Chickpea coconut curry',minutes:25,kind:'vegan',ingredients:{rice:75,chickpeas:120,tomatoes:100,veg:100,coconut:75,oil:5,spice:3},method:'Cook the rice according to its packet. Heat the oil and curry powder, then add tomatoes, chickpeas, peas and coconut milk. Simmer until piping hot and serve with rice.'},
 {id:'bean-rice',name:'Tomato bean rice bowl',minutes:20,kind:'vegan',ingredients:{rice:75,beans:120,tomatoes:150,veg:150,oil:5},method:'Cook the rice according to its packet. Heat the drained beans, tomatoes and peas in a pan with the oil until piping hot, then serve over the rice.'},
 {id:'egg-rice',name:'Egg & pea rice bowl',minutes:20,kind:'vegetarian',ingredients:{rice:75,eggs:2,veg:150,oil:5},method:'Cook the rice and peas according to their packets. Scramble the eggs in oil until fully set. Combine and serve immediately.'},
 {id:'cheese-pasta',name:'Cheesy tomato bean pasta',minutes:25,kind:'vegetarian',ingredients:{pasta:80,beans:120,tomatoes:150,cheese:30,veg:100,oil:5},method:'Cook the pasta. Heat the beans, tomatoes and peas with the oil until piping hot. Combine with drained pasta and melt in vegetarian cheddar.'},
 {id:'tuna-rice',name:'Tuna & pea rice bowl',minutes:20,kind:'fish',ingredients:{rice:75,tuna:102,tomatoes:100,veg:150,oil:5},method:'Cook rice according to the packet. Heat the peas and tomatoes with the oil, add drained tuna, and heat through before serving with rice.'},
 {id:'chicken-rice',name:'Chicken & tomato rice',minutes:30,kind:'meat',ingredients:{rice:75,chicken:150,tomatoes:150,veg:150,oil:5},method:'Cook rice separately. Cook diced chicken in the oil, add tomatoes and peas and simmer. Use a thermometer to confirm the centre of the chicken reaches 75°C, then serve with rice.'},
];
const nutrientKeys=['kcal','protein','carbs','fat','fibre'] as const;
export type Nutrition=Record<typeof nutrientKeys[number],number|null>;
export function nutritionFor(recipe:Recipe):Nutrition{
 const total: Nutrition={kcal:0,protein:0,carbs:0,fat:0,fibre:0};
 for(const [id,amount] of Object.entries(recipe.ingredients)){
 const food=products.find(p=>p.id===id)!;const source=nutrients[food.id].per100g;
 for(const key of nutrientKeys){if(source[key]===null)total[key]=null;else if(total[key]!==null)total[key]!+=source[key]!*amount*food.gramsPerUnit/100;}
 }
 return Object.fromEntries(nutrientKeys.map(k=>[k,total[k]===null?null:Math.round(total[k]!*(k==='kcal'?1:10))/(k==='kcal'?1:10)])) as Nutrition;
}
export function eligibleRecipes(c:Constraints){
 const allowed=c.diet==='vegan'?['vegan']:c.diet==='vegetarian'?['vegan','vegetarian']:c.diet==='pescatarian'?['vegan','vegetarian','fish']:['vegan','vegetarian','fish','meat'];
 return recipes.filter(r=>allowed.includes(r.kind)&&!Object.keys(r.ingredients).some(id=>products.find(p=>p.id===id)!.allergens.some(a=>c.exclusions.includes(a))));
}
export function validate(raw:unknown): Constraints {
 if(!raw || typeof raw !== 'object') throw Error('Please check your plan details.');
 const x=raw as Record<string,unknown>;
 const number=(k:string,min:number,max:number,integer=false)=>{const v=x[k];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw Error(`Check ${k}: use ${min}–${max}${integer?' whole':''}.`);return v;};
 if(typeof x.diet!=='string'||!Object.hasOwn(diets,x.diet))throw Error('Choose a dietary preference.');
 const exclusions=x.exclusions??[];if(!Array.isArray(exclusions)||exclusions.some(v=>!exclusionOptions.includes(v)))throw Error('Choose supported ingredient exclusions.');
 return {budget:number('budget',0,1000),dinners:number('dinners',1,14,true),collegeDays:number('collegeDays',0,14,true),fare:number('fare',0,20),buffer:number('buffer',0,1000),maxWalk:number('maxWalk',0,60,true),diet:x.diet as Constraints['diet'],exclusions:[...new Set(exclusions)] as Exclusion[],location:String(x.location||'Dublin').slice(0,80),endDate:String(x.endDate||'end of plan').slice(0,40),optionalMeal:x.optionalMeal===true};
}
export function optimise(c:Constraints){
 const budget=Math.round(c.budget*100),transport=c.collegeDays*2*Math.round(c.fare*100),reserve=Math.round(c.buffer*100);
 const eligible=eligibleRecipes(c);const candidates=[];
 const preferred={vegan:['lentil-pasta','curry','bean-rice'],vegetarian:['egg-rice','cheese-pasta','lentil-pasta'],pescatarian:['tuna-rice','egg-rice','bean-rice'],any:['chicken-rice','tuna-rice','lentil-pasta']}[c.diet];
 const varied=[...eligible].sort((a,b)=>(preferred.includes(a.id)?preferred.indexOf(a.id):99)-(preferred.includes(b.id)?preferred.indexOf(b.id):99)).slice(0,3);
 const simple=eligible.filter(r=>r.kind==='vegan').slice(0,2);
 for(const shop of [{name:'Nearby shop',walk:5,multiplier:1.2},{name:'Value shop',walk:18,multiplier:1}]){
 if(shop.walk>c.maxWalk)continue;
 for(const style of ['simple','variety']){
 const rotation=style==='simple'?simple:varied;if(!rotation.length)continue;
 const dinners=Array.from({length:c.dinners},(_,i)=>rotation[i%rotation.length]);
 const need:Record<string,number>={};for(const recipe of dinners)for(const [id,q]of Object.entries(recipe.ingredients))need[id]=(need[id]||0)+q;
 const basket=products.filter(p=>need[p.id]).map(p=>({...p,quantity:Math.ceil(need[p.id]/p.size),unitPrice:Math.round(p.price*shop.multiplier)})).map(p=>({...p,total:p.quantity*p.unitPrice}));
 const groceries=basket.reduce((s,p)=>s+p.total,0),meal=c.optionalMeal?500:0,total=transport+groceries+meal;
 const meals=dinners.map((d,i)=>({...d,day:i+1,nutrition:nutritionFor(d),ingredientsList:Object.entries(d.ingredients).map(([id,q])=>({name:products.find(p=>p.id===id)!.name,amount:q,unit:id==='eggs'?'eggs':id==='oil'||id==='coconut'?'ml':'g'}))}));
 const average=Object.fromEntries(nutrientKeys.map(k=>[k,meals.some(d=>d.nutrition[k]===null)?null:Math.round(meals.reduce((s,d)=>s+d.nutrition[k]!,0)/meals.length*10)/10])) as Nutrition;
 candidates.push({id:`${shop.name}-${style}`,shop:shop.name,walk:shop.walk,style,groceries,transport,meal,total,remaining:budget-total,reserve,basket,dinners:meals,nutrition:average,rotationCount:new Set(dinners.map(d=>d.id)).size,feasible:total+reserve<=budget,score:total+shop.walk*8+(style==='simple'?60:0)});
 }
 }
 candidates.sort((a,b)=>a.score-b.score);
 const feasible=candidates.filter(p=>p.feasible),cheapest=[...candidates].sort((a,b)=>a.total-b.total)[0]||null;
 return {constraints:c,plans:feasible,cheapest,shortfall:feasible.length?0:Math.max(0,(cheapest?.total??0)+reserve-budget),evaluated:candidates.length,eligibleCount:eligible.length,notice:'Sample prices and shop walks. Check current prices, stock, actual routes and your fare eligibility. This plan covers dinners only.'};
}
