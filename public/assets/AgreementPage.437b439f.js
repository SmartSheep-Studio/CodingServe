import{e as m,f as u,Q as g,R as p,i,s as l,q as o,m as e,t as r,l as _}from"./vendor.b28878af.js";import v from"./NotFoundPage.8f5a5258.js";import"./plugin-vue_export-helper.21dcd24c.js";const h={class:"container"},f={key:0,id:"agreement-renderer"},k={id:"renderer-show"},y={class:"text-center"},b={class:"text-secondary"},x=e("br",null,null,-1),$={class:"px-5 mx-5 pt-3"},B=["innerHTML"],L={class:"text-center pt-5"},N={key:1},M={setup(q){const{t:n}=m(),c=u(),t=g(c.params.page?c.params.page:c.query.page),s=p(()=>n("agreement.agreements."+t.value+".content")==="agreement.agreements."+t.value+".content"?null:{content:n("agreement.agreements."+t.value+".content").replace(/(?:\r\n|\r|\n)/g,"<br />"),date:n("agreement.agreements."+t.value+".date"),title:n("agreement.agreements."+t.value+".title")});return(a,d)=>(i(),l("div",h,[o(s)!=null?(i(),l("div",f,[e("div",k,[e("div",y,[e("h3",null,r(o(s).title),1),e("span",b,r(a.$t("agreement.release"))+" "+r(new Date(o(s).date).toLocaleString()),1),x]),e("div",$,[e("span",{innerHTML:o(s).content},null,8,B)]),e("div",L,[e("a",{href:"#",onClick:d[0]||(d[0]=w=>a.$router.back())},r(a.$t("common.actions.goback")),1)])])])):(i(),l("div",N,[_(v)]))]))}};export{M as default};