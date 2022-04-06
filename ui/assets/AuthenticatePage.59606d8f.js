import{e as S,u as I,a as v,L as R,g as x,f as L,Q as g,h as Q,i as r,s as u,m as t,q as i,t as s,p as o,l as b,k as y,F as B,A as F,ab as N,v as A,x as E}from"./vendor.87e1a7ff.js";import{u as P,_ as V}from"./index.f03dac3d.js";import{L as D}from"./VueElementLoading.common.f9eb4760.js";const U={class:"container-fluid row",style:{height:"100%"}},z={class:"col-lg-4 col-md-5 col-sm-6 position-absolute top-50 start-50 translate-middle"},M=t("h4",{class:"text-center",style:{"line-height":"60px"}},[t("img",{alt:"LumbaShark",height:"80",src:V,width:"80"})],-1),T={key:0,class:"card"},j={class:"card-body text-center"},G={key:1,class:"card text-white bg-danger mb-3"},H={class:"card-body"},J={class:"text-center"},K=t("hr",null,null,-1),O={class:"card-text"},W={class:"text-white",href:"https://fed.smartsheep.space/t/faq"},X={class:"text-white",href:"https://discord.gg/F4SgsEfQQ3"},Y=t("a",{class:"text-white",href:"mailto:littlesheep.code@hotmail.com"},[t("b",null,"littlesheep.code@hotmail.com")],-1),Z={key:2,class:"card"},tt={class:"card-body pb-0"},et={class:"text-center"},st=["src"],at={class:"text-secondary"},ot=t("br",null,null,-1),nt=t("hr",null,null,-1),lt={class:"card-body pt-0"},it={class:"text-center"},ct={class:"list-group"},rt={class:"list-group-item"},ut=t("input",{disabled:"",checked:"checked",class:"form-check-input me-1",type:"checkbox"},null,-1),dt={class:"pt-3"},ht={type:"button",class:"btn btn-secondary float-start",style:{width:"49%"}},pt=t("br",null,null,-1),_t=t("br",null,null,-1),mt={class:"text-center"},ft={class:"text-secondary"},vt={id:"loading"},$t={setup(gt){const{t:p}=S(),{cookies:$}=I(),_=v.create({validateStatus:()=>!0}),m=R(),d=P(),w=x(),h=L(),a=g(!1),k=g({}),n=g({});function q(){a.value=!0,_.post("/api/oauth",{client_id:h.query.client_id},{headers:{Authorization:"Bearer "+$.get("access_token")}}).then(e=>{a.value=!1,e.status===200?window.location.href=h.query.redirect_uri+"?code="+encodeURIComponent(e.data.code)+"&state="+encodeURIComponent(h.query.state):(m.error(p("common.messages.request-unknown-error")),console.error("Request response: ",e),a.value=!1)}).catch(e=>{m.error(p("common.messages.request-unknown-error")),console.error(e.message),a.value=!1})}function C(){a.value=!0;const e=_.get("/api/oauth",{params:h.query}),c=_.get("/api/management/developer/scopes");v.all([e,c]).then(v.spread((...l)=>{l[0].status===200||l[0].status===400?(n.value=l[0].data,k.value=l[1].data.data,a.value=!1):(m.error(p("common.messages.request-unknown-error")),console.error("Request response errors: ",l),a.value=!1)}))}return C(),(e,c)=>{const l=Q("router-link");return r(),u("div",U,[t("div",z,[M,a.value||i(d).status.pulling?(r(),u("div",T,[t("div",j,[t("span",null,[t("b",null,s(e.$t("common.loading")),1)])])])):n.value.error?(r(),u("div",G,[t("div",H,[t("div",J,[t("h6",null,s(e.$t("oauth.authenticate.failed.title")),1),t("span",null,s(n.value.error),1)]),K,t("div",O,[o(s(e.$t("oauth.authenticate.failed.descriptions.0"))+" ",1),t("ol",null,[t("li",null,s(e.$t("oauth.authenticate.failed.descriptions.1")),1),t("li",null,s(e.$t("oauth.authenticate.failed.descriptions.2")),1),t("li",null,[o(s(e.$t("oauth.authenticate.failed.descriptions.3"))+" ",1),t("a",W,[t("b",null,s(e.$t("oauth.authenticate.failed.descriptions.4")),1)])]),t("li",null,[o(s(e.$t("oauth.authenticate.failed.descriptions.5"))+" ",1),t("a",X,[t("b",null,s(e.$t("oauth.authenticate.failed.descriptions.6")),1)])]),t("li",null,[o(s(e.$t("oauth.authenticate.failed.descriptions.7"))+" ",1),Y])]),o(" "+s(e.$t("oauth.authenticate.failed.descriptions.8"))+" ",1),b(l,{to:{name:"introduce"},class:"text-white",href:"https://discord.gg/F4SgsEfQQ3"},{default:y(()=>[t("b",null,s(e.$t("oauth.authenticate.failed.descriptions.9")),1)]),_:1})])])])):(r(),u("div",Z,[t("div",tt,[t("div",et,[t("div",null,[t("img",{src:n.value.client.avatar,class:"rounded-circle",width:"42",height:"42"},null,8,st)]),t("span",null,[o(s(n.value.client.client_name)+" ",1),t("span",at,s(n.value.developer.username),1)]),ot,t("span",null,s(e.$t("oauth.authenticate.want")),1)])]),nt,t("div",lt,[t("h6",it,s(e.$t("oauth.authenticate.required")),1),t("div",null,[t("ul",ct,[(r(!0),u(B,null,F(n.value.client.scope.split(","),f=>(r(),u("li",rt,[ut,t("span",null,"\xA0"+s(k.value.details[f]),1)]))),256))])]),t("div",dt,[b(i(N),{onPositiveClick:c[0]||(c[0]=f=>i(w).push({name:"introduce"}))},{trigger:y(()=>[t("button",ht,s(e.$t("common.actions.cancel")),1)]),default:y(()=>[o(" "+s(e.$t("oauth.authenticate.cancel")),1)]),_:1}),t("button",{type:"button",class:"btn btn-success float-end",style:{width:"49%"},onClick:c[1]||(c[1]=f=>q())},s(e.$t("oauth.authenticate.grant")),1),pt,_t,t("div",mt,[t("span",ft,[o(s(e.$t("oauth.authenticate.grant-tip"))+" ",1),t("b",null,s(i(d).account.accountProfile.username),1)])])])])]))]),A(t("div",vt,[b(i(D),{active:a.value||i(d).status.pulling,"is-full-screen":""},null,8,["active"])],512),[[E,a.value||i(d).status.pulling]])])}}};export{$t as default};
