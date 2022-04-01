import{u as q,b as g,z as C,f as A,e as F,A as m,r as I,g as i,l as c,i as e,k as n,E as r,j as v,w as f,p as y,F as L,D as N,V as P,H as R,I as V,y as B}from"./vendor.19b3a550.js";import{u as E,_ as Q}from"./index.1c04caea.js";import{L as D}from"./VueElementLoading.common.0be4f9d8.js";const Y={class:"container-fluid row",style:{height:"100%"}},$={class:"col-lg-4 col-md-5 col-sm-6 position-absolute top-50 start-50 translate-middle"},z=e("h4",{class:"text-center",style:{"line-height":"60px"}},[e("img",{alt:"LumbaShark",height:"80",src:Q,width:"80"})],-1),J={key:0,class:"card"},W=e("div",{class:"card-body text-center"},[e("span",null,[e("b",null,"Loading...")])],-1),j=[W],G={key:1,class:"card text-white bg-danger mb-3"},H={class:"card-body"},K={class:"text-center"},M=e("h6",null,"Authenticate failed",-1),O=e("hr",null,null,-1),T={class:"card-text"},U=B(' You can follow the steps to try to solve this problem: <ol><li>Check your network status</li><li>Search the error code in document</li><li> Open a question in <a class="text-white" href="https://fed.smartsheep.space/t/faq"><b>FedSheep</b></a></li><li> Join our discord chat <a class="text-white" href="https://discord.gg/F4SgsEfQQ3"><b>Sheepland</b></a></li><li> Just send email to me <a class="text-white" href="mailto:littlesheep.code@hotmail.com"><b>littlesheep.code@hotmail.com</b></a></li></ol> If you want cancel the authenticate now, you can ',3),X=e("b",null,"click here",-1),Z={key:2,class:"card"},ee={class:"card-body pb-0"},te={class:"text-center"},se=["src"],oe={class:"text-secondary"},ae=e("br",null,null,-1),ne=e("span",null,"Want get your account information and get these permissions",-1),le=e("hr",null,null,-1),ie={class:"card-body pt-0"},ce=e("h6",{class:"text-center"},"Required Permissions",-1),re={class:"list-group"},de={class:"list-group-item"},ue=e("input",{disabled:"",checked:"checked",class:"form-check-input me-1",type:"checkbox"},null,-1),he={class:"pt-3"},_e=e("button",{type:"button",class:"btn btn-secondary float-start",style:{width:"49%"}}," Cancel ",-1),pe=y(" Are you really want cancel the authenticate? We will take you to the introduce page. "),ge=e("br",null,null,-1),me=e("br",null,null,-1),ve={class:"text-center"},fe={class:"text-secondary"},ye=y("You are grant access with "),be={id:"loading"},qe={setup(we){const{cookies:b}=q(),h=g.create({validateStatus:()=>!0}),_=C(),d=E(),w=A(),u=F(),t=m(!1),k=m({}),o=m({});function x(){t.value=!0,h.post("/api/oauth",{client_id:u.query.client_id},{headers:{Authorization:"Bearer "+b.get("access_token")}}).then(s=>{t.value=!1,s.status===200?window.location.href=u.query.redirect_uri+"?code="+s.data.code:(_.error("Something went wrong, please try again later, detail in developer console"),console.error("Request response: ",s),t.value=!1)}).catch(s=>{_.error("Something went wrong, please try again later, detail in developer console"),console.error(s.message),t.value=!1})}function S(){if(!b.isKey("access_token")){w.push({name:"user.login",params:{redirect:u.fullPath,message:"You didn't login yet, please login first"}});return}t.value=!0;const s=h.get("/api/oauth",{params:u.query}),l=h.get("/api/management/developer/scopes");g.all([s,l]).then(g.spread((...a)=>{a[0].status===200||a[0].status===400?(o.value=a[0].data,k.value=a[1].data.data,t.value=!1):(_.error("Something went wrong, please try again later, detail in developer console"),console.error("Request response errors: ",a),t.value=!1)}))}return S(),(s,l)=>{const a=I("router-link");return i(),c("div",Y,[e("div",$,[z,t.value||n(d).status.pulling?(i(),c("div",J,j)):o.value.error?(i(),c("div",G,[e("div",H,[e("div",K,[M,e("span",null,r(o.value.error),1)]),O,e("div",T,[U,v(a,{to:{name:"introduce"},class:"text-white",href:"https://discord.gg/F4SgsEfQQ3"},{default:f(()=>[X]),_:1})])])])):(i(),c("div",Z,[e("div",ee,[e("div",te,[e("div",null,[e("img",{src:o.value.client.avatar,class:"rounded-circle",width:"42",height:"42"},null,8,se)]),e("span",null,[y(r(o.value.client.client_name)+" ",1),e("span",oe,r(o.value.developer.username),1)]),ae,ne])]),le,e("div",ie,[ce,e("div",null,[e("ul",re,[(i(!0),c(L,null,N(o.value.client.scope.split(","),p=>(i(),c("li",de,[ue,e("span",null,"\xA0"+r(k.value.details[p]),1)]))),256))])]),e("div",he,[v(n(P),{onPositiveClick:l[0]||(l[0]=p=>n(w).push({name:"introduce"}))},{trigger:f(()=>[_e]),default:f(()=>[pe]),_:1}),e("button",{type:"button",class:"btn btn-success float-end",style:{width:"49%"},onClick:l[1]||(l[1]=p=>x())}," Grant access "),ge,me,e("div",ve,[e("span",fe,[ye,e("b",null,r(n(d).account.accountProfile.username),1)])])])])]))]),R(e("div",be,[v(n(D),{active:t.value||n(d).status.pulling,"is-full-screen":""},null,8,["active"])],512),[[V,t.value||n(d).status.pulling]])])}}};export{qe as default};