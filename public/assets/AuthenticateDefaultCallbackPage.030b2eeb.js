import{_}from"./index.f23bfad6.js";import{e as m,f as g,L as b,af as y,i,s as n,m as s,t as e,p as d,l as v,q as c,a1 as f,k as u,v as k}from"./vendor.b28878af.js";const w={class:"container-fluid row",style:{height:"100%"}},$={class:"col-lg-3 col-md-5 col-sm-6 position-absolute top-50 start-50 translate-middle"},N=s("h4",{class:"text-center",style:{"line-height":"60px"}},[s("img",{alt:"LumbaShark",height:"80",src:_,width:"80"})],-1),q={class:"card text-white bg-success mb-3"},x={class:"card-body"},B={class:"text-center"},D=s("br",null,null,-1),S=s("hr",null,null,-1),V={class:"card-body"},E={class:"alert alert-light"},L={style:{cursor:"copy"}},R={setup(T){const{t:a}=m(),l=g(),r=b();function h(){r.error(a("common.message.copy-failed")),console.log(error)}function p(){r.success(a("common.messages.copy-success"))}return(t,C)=>{const o=y("clipboard");return i(),n("div",w,[s("div",$,[N,s("div",q,[s("div",x,[s("div",B,[s("h6",null,e(t.$t("oauth.callback.title")),1),s("span",null,e(t.$t("oauth.callback.descriptions.0")),1),D,s("span",null,[s("b",null,e(t.$t("oauth.callback.descriptions.1")),1),d(e(t.$t("oauth.callback.descriptions.2")),1)])])]),S,s("div",V,[s("div",E,[s("span",null,[v(c(f),{trigger:"hover"},{trigger:u(()=>[k((i(),n("code",L,[s("b",null,e(c(l).query.code),1)])),[[o,c(l).query.code,"copy"],[o,p,"success"],[o,h,"error"]])]),default:u(()=>[d(" "+e(t.$t("oauth.callback.copy")),1)]),_:1})])])])])])])}}};export{R as default};
