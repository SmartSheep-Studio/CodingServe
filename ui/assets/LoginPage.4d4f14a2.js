import{u as b,b as x,z as S,f as N,e as q,A as g,C as B,o as C,g as M,l as U,i as o,j as n,k as s,M as F,w as d,O as f,P as h,R as w,Q as _,S as K,p as L}from"./vendor.19b3a550.js";import{_ as P}from"./index.1c04caea.js";const R={class:"container-fluid row",style:{height:"100%"}},T={class:"col-lg-3 col-md-4 col-sm-5 position-absolute top-50 start-50 translate-middle"},V=o("h4",{class:"text-center",style:{"line-height":"60px"}},[o("img",{alt:"LumbaShark",height:"80",src:P,width:"80"})],-1),j={class:"card"},A={class:"card-body"},E=o("h6",{class:"text-center"},"Login",-1),I=o("br",null,null,-1),W=L(" Login "),Q={setup(z){const v={username:[{required:!0,message:"Username is required"}],password:[{required:!0,message:"Password is required"}]},{cookies:m}=b(),y=x.create({validateStatus:()=>!0}),r=S(),l=N(),i=q(),u=g(!1),p=g(null),a=B({username:"",password:"",remember:!1});C(()=>{i.params.message&&r.info(i.params.message)});function k(){var c;(c=p.value)==null||c.validate(t=>{t||(u.value=!0,y.post("/api/authenticate",{username:a.username,password:a.password}).then(e=>{e.status===201?(r.success("Successfully logged in"),console.log("[SAFETY] Successfully logged in, there is your JWT, please do not share to anyone, just for client development and test: ",e.data.token),a.remember?m.set("access_token",e.data.token,"30d"):m.set("access_token",e.data.token,0),i.params.redirect?l.push(i.params.redirect).then(()=>l.go()):l.push({name:"introduce"}).then(()=>l.go())):e.status===401?r.warning("Wrong username or password"):r.error("Something went wrong, please try again later"),u.value=!1}).catch(e=>{r.error("Something went wrong, please try again later, detail in developer console"),r.error(e.message),u.value=!1}))})}return(c,t)=>(M(),U("div",R,[o("div",T,[V,o("div",j,[o("div",A,[E,I,n(s(F),{ref_key:"form",ref:p,model:s(a),rules:v},{default:d(()=>[n(s(f),{label:"Username",path:"username"},{default:d(()=>[n(s(_),{value:s(a).username,"onUpdate:value":t[0]||(t[0]=e=>s(a).username=e),onKeydown:t[1]||(t[1]=h(w(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1}),n(s(f),{label:"Password",path:"password"},{default:d(()=>[n(s(_),{value:s(a).password,"onUpdate:value":t[2]||(t[2]=e=>s(a).password=e),type:"password",onKeydown:t[3]||(t[3]=h(w(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1}),n(s(K),{loading:u.value,style:{width:"100%"},type:"primary",onClick:k},{default:d(()=>[W]),_:1},8,["loading"])]),_:1},8,["model"])])])])]))}};export{Q as default};
