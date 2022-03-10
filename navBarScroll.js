const pages = document.querySelectorAll('.page');
const navLi = document.querySelectorAll('nav li');
const scr = document.getElementById('scrollableScreen');
console.log(pages);
console.log(scr);

scr.onscroll = () => {
var current = "";
pages.forEach((page) => {
    const pageTop = page.offsetTop;
    if(scr.scrollTop >= (pageTop - 400)) {
    current = page.getAttribute('id');
    }
});

navLi.forEach((li) => {
    li.classList.remove('active');
    
    if(li.classList.contains(current)){
    li.classList.add('active');
    }
});
};