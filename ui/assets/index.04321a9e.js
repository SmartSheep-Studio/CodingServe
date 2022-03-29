import{c as E,a as w,u as P,b as A,d as C,r as p,o as _,e as h,w as a,f as t,g as c,n as v,h as g,i as y,T as O,j as S,N as I,k as u,l as R,m as T}from"./vendor.1807f42b.js";const N=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function l(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerpolicy&&(o.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?o.credentials="include":e.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(e){if(e.ep)return;e.ep=!0;const o=l(e);fetch(e.href,o)}};N();const V="modulepreload",b={},j="/",d=function(r,l){return!l||l.length===0?r():Promise.all(l.map(s=>{if(s=`${j}${s}`,s in b)return;b[s]=!0;const e=s.endsWith(".css"),o=e?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${o}`))return;const n=document.createElement("link");if(n.rel=e?"stylesheet":V,e||(n.as="script",n.crossOrigin=""),n.href=s,document.head.appendChild(n),e)return new Promise((f,i)=>{n.addEventListener("load",f),n.addEventListener("error",()=>i(new Error(`Unable to preload CSS for ${s}`)))})})).then(()=>r())},q=E({history:w(),routes:[{path:"/",name:"introduce",component:()=>d(()=>import("./IntroducePage.5f147dad.js"),["assets/IntroducePage.5f147dad.js","assets/IntroducePage.a449150c.css","assets/vendor.1807f42b.js","assets/plugin-vue_export-helper.21dcd24c.js"])},{path:"/faqs",name:"faqs",component:()=>d(()=>import("./FAQsPage.3cae1aa9.js"),["assets/FAQsPage.3cae1aa9.js","assets/plugin-vue_export-helper.21dcd24c.js","assets/vendor.1807f42b.js"])},{path:"/user/signup",name:"user.signup",component:()=>d(()=>import("./SignUpPage.db860870.js"),["assets/SignUpPage.db860870.js","assets/vendor.1807f42b.js","assets/index.15c82977.js"])},{path:"/user/login",name:"user.login",component:()=>d(()=>import("./LoginPage.846d6f3c.js"),["assets/LoginPage.846d6f3c.js","assets/vendor.1807f42b.js","assets/index.15c82977.js"])},{path:"/oauth",name:"oauth.authenticate",component:()=>d(()=>import("./AuthenticatePage.a86009c6.js"),["assets/AuthenticatePage.a86009c6.js","assets/AuthenticatePage.1d21a84c.css","assets/vendor.1807f42b.js","assets/index.15c82977.js"])},{path:"/oauth/callback",name:"oauth.callback",component:()=>d(()=>import("./AuthenticateDefaultCallbackPage.d3e2b4ce.js"),["assets/AuthenticateDefaultCallbackPage.d3e2b4ce.js","assets/vendor.1807f42b.js"])}]});var k="/assets/Logo.3586b61e.png";const D={id:"root"},B={class:"container"},$={class:"d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom"},F=t("a",{class:"d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none",href:"/"},[t("img",{alt:"Logo",height:"42",src:k,width:"42"}),u(" \xA0 LumbaShark ")],-1),K={class:"nav col-12 col-md-auto mb-2 justify-content-center mb-md-0"},Q=u("Introduce"),U=u("FAQs"),W={key:0,class:"col-md-3 text-end"},z=u("Login"),H=u("Sign Up"),M={key:1,class:"col-md-3 text-end"},G={id:"content"},J={class:"container"},X={class:"d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top"},Y=t("p",{class:"col-md-4 mb-0 text-muted"},"SmartSheep Studio \xA9 2022",-1),Z=t("a",{class:"col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none",href:"/"},[t("img",{alt:"Logo",height:"42",src:k,width:"42"})],-1),ee={class:"nav col-md-4 justify-content-end"},te={class:"nav-item"},oe=u("Introduce"),ne={class:"nav-item"},se=u("FAQs"),re={setup(m){const{cookies:r}=P(),l=A(),s=C();function e(n){return n===l.name?"nav-link px-2 link-secondary":"nav-link px-2 link-dark"}function o(){r.remove("access_token"),s.go()}return(n,f)=>{const i=p("router-link"),x=p("router-view");return _(),h(g(I),null,{default:a(()=>[t("div",D,[t("div",B,[t("header",$,[F,t("ul",K,[t("li",null,[c(i,{class:v(e("introduce")),to:{name:"introduce"}},{default:a(()=>[Q]),_:1},8,["class"])]),t("li",null,[c(i,{class:v(e("faqs")),to:{name:"faqs"}},{default:a(()=>[U]),_:1},8,["class"])])]),g(r).isKey("access_token")?(_(),y("div",M,[t("button",{class:"btn btn-link text-decoration-none",onClick:o}," Logout ")])):(_(),y("div",W,[c(i,{to:{name:"user.login"},class:"btn btn-outline-primary me-2"},{default:a(()=>[z]),_:1},8,["to"]),c(i,{to:{name:"user.signup"},class:"btn btn-primary"},{default:a(()=>[H]),_:1},8,["to"])]))])]),t("div",G,[c(x,null,{default:a(({Component:L})=>[c(O,{name:"fade"},{default:a(()=>[(_(),h(S(L)))]),_:2},1024)]),_:1})]),t("div",J,[t("footer",X,[Y,Z,t("ul",ee,[t("li",te,[c(i,{to:{name:"introduce"},class:"nav-link px-2 text-muted",href:"#"},{default:a(()=>[oe]),_:1})]),t("li",ne,[c(i,{to:{name:"faqs"},class:"nav-link px-2 text-muted",href:"#"},{default:a(()=>[se]),_:1})])])])])])]),_:1})}}};R(re).use(T,{autoSetContainer:!0,appendToBody:!0}).use(q).mount("#app");export{k as _};
