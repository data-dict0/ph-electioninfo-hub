/*

Social Share Links:

Facebook:
https://www.facebook.com/sharer.php?u=[post-url]

Twitter:
https://twitter.com/share?url=[post-url]&text=[post-title]

LinkedIn: 
https://www.linkedin.com/shareArticle?url=[post-url]&title=[post-title]

Whatsapp:
https://api.whatsapp.com/send?text=[post-title] [post-url]

*/

const facebookBtn = document.querySelector(".facebook-btn");
const linkedinBtn = document.querySelector(".linkedin-btn");
const whatsappBtn = document.querySelector(".whatsapp-btn");

function init() {
    let postUrl = encodeURI(document.location.href);
    let postTitle = encodeURI("Hi everyone. Please check this out: ");

    facebookBtn.setAttribute(
        "href", 
        `https://www.facebook.com/sharer.php?u=${postUrl}`
);

    linkedinBtn.setAttribute(
        "href", 
        `https://www.linkedin.com/shareArticle?url=${postUrl}&title=${postTitle}`
);

    whatsappBtn.setAttribute(
        "href", 
        `https://api.whatsapp.com/send?text=${postTitle} ${postUrl}`
);

}

init();