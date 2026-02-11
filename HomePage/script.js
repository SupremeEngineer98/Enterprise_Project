
const images = document.querySelectorAll('#slider img');
let index = 0;

function nextImage() {
  // 1. remove the "active"
  images[index].classList.remove('active');
  
  // 2. loop for all pictures
  index = (index + 1) % images.length;
  
  // 3. let the next picture be "active"
  images[index].classList.add('active');
}

// automatic change every 3 second
setInterval(nextImage, 3000);

//event listener for project's one button!
document.getElementById('project-title-1').addEventListener('click',function(){

  //creating a modal window to display project's 1 data!
})
