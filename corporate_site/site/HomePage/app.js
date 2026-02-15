//function to fetch the data
function fetch_images() {
    //fetching the data from the endpoint
  fetch('/carousel/images')
   .then(response => {
   if (!response.ok) {
     throw new Error('Error: Cannot fetch the images from the server');
    }
     return response.json();
        })
        .then(data => {
 const slideArea = document.querySelector('#hero .slider-area');//accessing the class!
    let currentIndex = 0;
  const images = [];

    //for each loop through each image
  data.images.forEach((image, index) => {
     //img tag for each image
     const img = document.createElement('img');
       img.src = `http://localhost:3000${image.image}`;
    img.alt = image.title || 'Image';
       img.classList.add('slider-image');

                // Append image to the slider
      slideArea.appendChild(img);
      images.push(img); // Add image to the images array
              //first image is active
      if (index === 0) {
       img.classList.add('active');
        }
      });

      //this function shows the next image!
     function nextImage() {
      //removing the active
       images[currentIndex].classList.remove('active');

      //incrementing index + 1
       currentIndex = (currentIndex + 1) % images.length;

      //adding the active element in the next image
      images[currentIndex].classList.add('active');
            }

       //interval function to change images every 3 secs
         setInterval(nextImage, 3000);
        })
        .catch(error => {
            console.error(`Error: Cannot fetch images: ${error.message}`);
        });
}


//method to fetch company's info from the api
function fetch_info(){
    //fetching the endpoint!
    fetch('/company_info/get')
    .then(response=>{//getting the response!

      if(!response.ok){//returning an error message if server failed to send a response!
        throw new Error('Error while server was trying to respond!');
      }
      //returning data in json format!
      return response.json();
     
      })
       //returning the data!
      .then(data=>{
        //accessing the class which company's info will be displayed!
        const info = document.querySelector('.content-text');
        
        //creating a variable to display the info!
        const text = document.createElement('p');//creating a <p> element!
         text.innerHTML = data.info[0].content;
        info.appendChild(text);//appending the text!

        //creating a variable to access the logo section in order to fetch the logo!
         const logo = document.querySelector('.logo');

         //creating the image element!
         const image = document.createElement('img');
         //fetching the image!
         image.src = data.info[0].company_image;

         //appending image to the logo section!
         logo.append(image);
    })
    .catch(error=>{//catching the error to return in to user!
        console.log(`Error cannot fetch the data:${error.message}`);
    })
}


//creating the method to fetch contact info!
function fetch_contact_info(){
    //fetching the endpoint!
    fetch('/contact/info/get')
    .then(response=>{//receiving the response!
        //returning an error message if server does not respond!
        if(!response.ok)
        {
            throw new Error('Server does not respond');
        }
        return response.json();//receiving response in json format!
        
    })
    //returning the data!
    .then(data=>{
        //accessing the dom class where the data will be displayed!
        const contact_info = document.getElementById('contact_details');
        //creating a <p> element to dispay the contact info!
        const email_element = document.createElement('p');
        email_element.className = 'email-el';
        
        //creating a <p> element to display the phone number!
        const phone_element = document.createElement('p');
        phone_element.className = 'phone-el';

        //creating a <p> element to display the address!
        const address_element = document.createElement('p');
        address_element.className = 'address-el';
        
        //displaying the data!
        email_element.innerHTML = data.contacts[0].email;

        //displaying the phone!
        phone_element.innerHTML = data.contacts[0].phone;

        //displaying the address!
        address_element.innerHTML = data.contacts[0].address;
        

        //pushing email to the contanct info with append!
        contact_info.appendChild(email_element);
        //pushing phone to the main element!
        contact_info.appendChild(phone_element);
        //pushing the address element to the main element!
        contact_info.appendChild(address_element);
    })
    .catch(error=>{
        //catching the error to allow users see it!
        console.log(`Error cannot fetch the data:${error.message}`);
    })
}

//method to display project in a modal window by fetching project's data from the api!
function fetch_project(){
 
//retrieving the id from the data-id to fetch the project!
const projectId = this.getAttribute('data-id');
 //fetching the api endpoint!
 fetch(`/winwise/view_project/${projectId}`)
 .then(response=>{
  //returning an error message if server does not send a response!
  if(!response.ok)
  {
    throw new Error(`Error. Cannot fetch for the reason:${error.message}`);
  }
  //retrurning response in json format!
  return response.json();

 })
  //returning the data!
  .then(data=>{
    

    //access to the modal body in order to append the image!
      const modalFooter = document.querySelector('.modal-footer');
      const modalBody = document.querySelector('.modal-body');
       const modalImage = modalBody.querySelector('img'); //creating a new variable in order to access modal's body image section

      //clearing body from previews data if any!
      //modalBody.innerHTML = '';
     //creating the element to display the title!
     const title = document.getElementById('myModalLabel');

     //appending the title to the title element!
     title.innerHTML = data.project[0].project;

    //removing the previews image if exists!
      if (modalImage) {
        modalImage.remove();
      }
     //creating an img element to append the img image!
     const img = document.createElement('img');
       //defining image's src!
      img.src = `/upload_images/${data.project[0].image}`;

      img.style.width = '100%';
     
    

    // Insert the image above the footer
    modalBody.insertBefore(img, modalFooter);
     
    //accessing the <p> element to display the text
 const project_det = document.getElementById('project-details');

  //getting project's id 1 data!
  project_det.innerHTML = data.project[0].description;

     

  })
  .catch(error=>{
        //catching the error to allow users see it!
        console.log(`Error cannot fetch the data:${error.message}`);
    })

}


//creating a new function to fetch about us content!
function fetch_aboutUs(){
   //accessing the html element which is responsible to store the about us text!
   about_text = document.getElementById('about_content');
    
   //using the fetch method to fetch the content from the API!
   fetch('/company_info/get')
   .then(response=>{//retrieving the response from the API!
      //returning an error message if the API fail  to respond!
      if(!response.ok){
        throw new Error(`Error. Failed to fetch:${error.message}`);

      }
      //returning data in json format!
      return response.json();
   })
   //returning the fetched data if all goes well!
   .then(data=>{
    console.log(data);//console logging the data to see what the api sends back!

     //creating the new html element to store the text!
     text_data = document.createElement('p');

     //storing the data to the element!
     text_data.innerHTML = data.info[0].content;

     //appending text_data to the about_text
     about_text.append(text_data);

     //accessing the img element to fetch company's logo!
     image_logo = document.getElementById('logo_img');

     //fetching the image!
     image_logo.src = data.info[0].company_image;
     image_logo.style.width = "100%";
   })
   .catch(error=>{
    //catching the error to send it back!
    console.log(`Error cannot fetch the data:${error.message}`);
   })

}
fetch_images();//using the function to fetch the images

//calling the function to display the fetched text
fetch_info();

//calling the function to retrieve contact info!
fetch_contact_info();

//attatching the event listener to each button after the dom loads!
document.addEventListener('DOMContentLoaded',function(){
  //getting all the project-view buttons by their data id!
  const buttons = document.querySelectorAll('[data-id]');

  //adding the event listener to each button!
  buttons.forEach(button=>{
    button.addEventListener('click',fetch_project)
  });
});

//calling the method to return the about us content!
fetch_aboutUs();

