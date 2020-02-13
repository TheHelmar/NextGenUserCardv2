// ==UserScript==
// @name         Better SE User Card overlay (API usage)
// @namespace    https://github.com/TheHelmar/NextGenUserCardv2
// @homepage     https://github.com/TheHelmar/NextGenUserCardv2
// @version      0.5.4
// @description  Provides a new User Card showing question & answer count
// @author       Helmar
// @match        https://*.stackexchange.com/questions*
// @match        https://*.stackoverflow.com/questions*
// @match        https://*.superuser.com/questions*
// @match        https://*.serverfault.com/questions*
// @match        https://*.askubuntu.com/questions*
// @match        https://*.stackapps.com/questions*
// @match        https://*.mathoverflow.net/questions*
// @downloadURL  https://github.com/TheHelmar/NextGenUserCardv2/raw/master/seUserCardsv2.user.js
// @updateURL    https://github.com/TheHelmar/NextGenUserCardv2/raw/master/seUserCardsv2.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var posts = document.querySelectorAll("div.user-details");
    [].forEach.call(posts, function(posts) {
        //replacing all user flairs
        let userURL = `` + posts.querySelector("a");
        //Query SE API regarding user
        let userID = /[0-9]+/.exec(userURL);
        if(userID!=null)
        {
            let seSite= /[a-z]+/.exec(window.location.host);

            let apiCall = "https://api.stackexchange.com/2.2/users/"+userID+"/posts?order=desc&sort=activity&site="+seSite+"&pagesize=100&filter=!nDZxVNm(-a";
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let userPosts = JSON.parse(this.responseText);
                    let userQuestions = new Array;
                    let userAnswers = new Array;
                    for(let i=0; i<userPosts.items.length;i++)
                    {
                        if(userPosts.items[i].post_type=="question")
                        {
                            userQuestions.push(userPosts.items[i].score);
                        }else
                        {
                            userAnswers.push(userPosts.items[i].score);
                        }
                    }
                    let userMaxQ=0
                    let userMaxA=0
                    let userMinQ=0
                    let userMinA=0
                    let userAvgQ=0
                    let userAvgA=0
                    if(userQuestions.length>0)
                    {
                        userMaxQ=Math.max(...userQuestions);
                        userMinQ=Math.min(...userQuestions);
                        userAvgQ=Math.round(userQuestions.reduce((a,b) => a + b, 0)/userQuestions.length);
                    }
                    if(userAnswers.length>0)
                    {
                        userAvgA=Math.round(userAnswers.reduce((a,b) => a + b, 0)/userAnswers.length)
                        userMinA=Math.min(...userAnswers);
                        userMaxA=Math.max(...userAnswers);
                    }
                    let newUserCard = `
<br><span>Q: Ø ` + userAvgQ + `; From: ` + userMinQ + `..` + userMaxQ + `</span>
<br><span>A: Ø ` + userAvgA + `; From: ` + userMinA + `..` + userMaxA + `</span>
`
                    posts.querySelector("div").innerHTML=posts.querySelector("div").innerHTML+newUserCard;
                }else
                {
                    if(this.readyState == 4 && this.status==400)posts.querySelector("div").innerHTML=posts.querySelector("div").innerHTML+"<br><span>SE API rate limited</span>";
                }
            };
            xmlhttp.open("GET", apiCall, true);
            xmlhttp.send();

            //Query User Page (not affected by rate limiting)
            let userPage = document.implementation.createHTMLDocument("");
            let userPageData;
            $.get(userURL, function(userPageData, status){
                userPage.documentElement.innerHTML = userPageData;
                //Get counts
                let questionCount="Error";
                let answerCount="Error";
                //Full Sites
                try{questionCount=/[0-9,]+/g.exec(userPage.querySelector("#user-card > div > div.grid--cell.fl1.wmn0 > div > div.grid--cell.fl-shrink0.pr24.wmx3 > div.fc-medium.mb16 > div > div:nth-child(2) > div > div.grid--cell.fs-body3.fc-dark.fw-bold").innerHTML);}catch(err){}
                try{answerCount=/[0-9,]+/g.exec(userPage.querySelector("#user-card > div > div.grid--cell.fl1.wmn0 > div > div.grid--cell.fl-shrink0.pr24.wmx3 > div.fc-medium.mb16 > div > div:nth-child(1) > div > div.grid--cell.fs-body3.fc-dark.fw-bold").innerHTML);}catch(err){}
                //Beta sites
                try{questionCount=/[0-9]+/g.exec(userPage.querySelector("#user-panel-questions > div.subheader.p0.grid.ai-center > h3 > a > span").innerHTML);}catch(err){}
                try{answerCount=/[0-9]+/g.exec(userPage.querySelector("#user-panel-answers > div.subheader.p0.grid.ai-center > h3 > a > span").innerHTML);}catch(err){}
                //Build new User Card
                let newUserCard = `
<span>Q: ` + questionCount + `</span>
<span>A: ` + answerCount + `</span>
`
                //Replace User Flair if values are available
                if(questionCount!="Error"&&answerCount!="Error")
                {
                    posts.querySelector("div").innerHTML=newUserCard;
                }
            });//userPage
        }
    });//Loop over flairs
})();

