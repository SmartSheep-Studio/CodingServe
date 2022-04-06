import{e as P,g as V,a as B,L as D,Q as h,r as R,i as b,s as k,m as n,t as m,l,q as r,S as q,k as i,U as C,V as v,W as f,X as g,Y as p,Z as N,p as y,_ as S}from"./vendor.87e1a7ff.js";import{_ as Z}from"./index.f03dac3d.js";const z={class:"container-fluid row",style:{height:"100%"}},A={class:"col-lg-3 col-md-4 col-sm-5 position-absolute top-50 start-50 translate-middle"},I=n("h4",{class:"text-center",style:{"line-height":"60px"}},[n("img",{alt:"LumbaShark",height:"80",src:Z,width:"80"})],-1),L={class:"card"},x={key:0,class:"card-body"},F={class:"text-center"},M=n("br",null,null,-1),Q={class:"pt-2 text-center"},T={class:"text-secondary"},W={key:1,class:"card-body"},X={class:"text-center"},Y=n("br",null,null,-1),J={setup(j){const{t:o}=P(),_={username:[{required:!0,message:o("user.register.validate.username")}],email:[{required:!0,message:o("user.register.validate.email")},{validator:(s,e)=>{if(!new RegExp(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/).test(e))return new Error(o("user.register.validate.email-invalid"))}}],password:[{required:!0,message:o("user.register.validate.password")}],confirmPassword:[{required:!0,message:o("user.register.validate.confirm-password")},{validator:(s,e)=>{if(e!==a.password)return new Error(o("user.register.validate.confirm-password-invalid"))}}],verifyCode:[{required:!0,message:o("user.register.validate.verify-code")}]},E=V(),$=B.create({validateStatus:()=>!0}),u=D(),d=h(!1),w=h(null),c=h(0),a=R({email:"",username:"",password:"",confirmPassword:"",agreement:!1,verifyCode:""});function K(){var s;(s=w.value)==null||s.validate(e=>{e||(d.value=!0,$.post("/api/management/users",{username:a.username,password:a.password,email:a.email}).catch(()=>{u.error(o("common.message.request-unknown-error")),d.value=!1}).then(t=>{t.status===201?(u.success(o("user.register.messages.require-verify")),c.value++):t.data.error==="DataError#2"?u.warning(o("user.register.messages.used-email")):t.data.error==="DataError#1"?u.warning(o("user.register.messages.used-username")):(u.error(o("common.messages.request-unknown-error")),console.error("Request error: "+t)),d.value=!1}))})}function U(){var s;(s=w.value)==null||s.validate(e=>{e||(d.value=!0,$.post(`/api/management/users?verify=${a.verifyCode}`).catch(()=>{u.error(o("common.messages.request-unknown-error")),d.value=!1}).then(t=>{t.status===200?(u.success(o("user.register.messages.success")),E.push({name:"user.login"})):t.data.error==="DataError"?u.warning(o("user.register.messages.invalid-verify")):(u.error(o("common.messages.request-unknown-error")),d.value=!1),d.value=!1}))})}return(s,e)=>(b(),k("div",z,[n("div",A,[I,n("div",L,[c.value===0?(b(),k("div",x,[n("h6",F,m(s.$t("user.register.title")),1),M,l(r(q),{ref_key:"form",ref:w,model:r(a),rules:_},{default:i(()=>[l(r(v),{label:s.$t("user.register.username"),path:"username"},{default:i(()=>[l(r(g),{value:r(a).username,"onUpdate:value":e[0]||(e[0]=t=>r(a).username=t),onKeydown:e[1]||(e[1]=f(p(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),l(r(v),{label:s.$t("user.register.email"),path:"email"},{default:i(()=>[l(r(g),{value:r(a).email,"onUpdate:value":e[2]||(e[2]=t=>r(a).email=t),onKeydown:e[3]||(e[3]=f(p(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),l(r(v),{label:s.$t("user.register.password"),path:"password"},{default:i(()=>[l(r(g),{value:r(a).password,"onUpdate:value":e[4]||(e[4]=t=>r(a).password=t),type:"password",onKeydown:e[5]||(e[5]=f(p(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),l(r(v),{label:s.$t("user.register.confirm-password"),path:"confirmPassword"},{default:i(()=>[l(r(g),{value:r(a).confirmPassword,"onUpdate:value":e[6]||(e[6]=t=>r(a).confirmPassword=t),type:"password",onKeydown:e[7]||(e[7]=f(p(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),l(r(N),{loading:d.value,style:{width:"100%"},type:"primary",onClick:K},{default:i(()=>[y(m(s.$t("user.register.title")),1)]),_:1},8,["loading"]),n("div",Q,[n("span",T,[y(m(s.$t("user.register.agreement.0"))+" ",1),l(r(S),{to:{name:"agreement",query:{page:"user-must-known"}}},{default:i(()=>[y(m(s.$t("user.register.agreement.1")),1)]),_:1})])])]),_:1},8,["model"])])):C("",!0),c.value===1?(b(),k("div",W,[n("h6",X,m(s.$t("user.register.title")),1),Y,l(r(q),{ref_key:"form",ref:w,model:r(a),rules:_},{default:i(()=>[l(r(v),{label:s.$t("user.register.verify-code"),path:"verifyCode"},{default:i(()=>[l(r(g),{value:r(a).verifyCode,"onUpdate:value":e[8]||(e[8]=t=>r(a).verifyCode=t),onKeydown:e[9]||(e[9]=f(p(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),l(r(N),{loading:d.value,style:{width:"100%"},type:"primary",onClick:U},{default:i(()=>[y(m(s.$t("user.register.verify")),1)]),_:1},8,["loading"])]),_:1},8,["model"])])):C("",!0)])])]))}};export{J as default};
