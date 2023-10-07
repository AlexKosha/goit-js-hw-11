import { Notify } from "notiflix";
import PhotosApiService from "./js/photos-api";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs ={
    form : document.querySelector(".search-form"),
    gallery : document.querySelector('.gallery'),
    guard: document.querySelector('.js-guard')
}

const photosApiService = new PhotosApiService();

const galleryModal = new SimpleLightbox('.gallery .gallery__link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

refs.form.addEventListener('submit', onSearch)
refs.gallery.addEventListener('click', onOpenModal)

function onSearch(e){
    e.preventDefault();
    
    photosApiService.query = e.currentTarget.elements.searchQuery.value
    photosApiService.resetPage();

    photosApiService.fetchPhotos()
    .then((data) => {
        if (data.totalHits === 0) {
            throw new Error (data.status)
        }

        photosApiService.total = data.totalHits;

        clearGalleryContainer()
        appendGalleryMarkup(data.hits)
        observer.observe(refs.guard)
        smoothScroll(0.2)

        Notify.info(`Hooray! We found ${data.totalHits} images.`)

        photosApiService.incrementPage()
    })
    .catch(err => Notify.failure("Sorry, there are no images matching your search query. Please try again."))

}

let options = {
    root: null,
    rootMargin: "500px",
    threshold: 1.0,
  };
  
  let observer = new IntersectionObserver(onLoad, options);
  
  function onLoad(entries){
    entries.forEach((entry) => {
        if(entry.isIntersecting){
            photosApiService.fetchPhotos()
            .then(data => {
                appendGalleryMarkup(data.hits)  
                photosApiService.incrementPage()  
                smoothScroll(2.3)  
                disabledBtn(photosApiService.page ,photosApiService.maxPage());  
         }).catch(err => console.log(err))
        }
    });
}

function smoothScroll(number) {
    const { height: cardHeight } = refs.gallery
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * number,
  behavior: "smooth",
});
}

function onOpenModal(e) {
    e.preventDefault();
  
    galleryModal.on('show.SimpleLightbox');
  
    galleryModal.on('close.SimpleLightbox');
}

function appendGalleryMarkup(photos){
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(photos));
    galleryModal.refresh();
}

function clearGalleryContainer (){
    refs.gallery.innerHTML = ''
}

function disabledBtn(page, maxPage){
    if (page > maxPage) {
        Notify.warning("We're sorry, but you've reached the end of search results.")  
        observer.unobserve(refs.guard)
    }
}

function createMarkup (arr){
return arr.map(({tags, webformatURL, largeImageURL, views, likes, comments, downloads}) =>  `<div class="photo-card">
    <a class="gallery__link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width='360' height='300'/>
    </a>
  <div class="info">
    <p class="info-item">
    likes
        <b>${likes}</b>
    </p>
    <p class="info-item">
    views
        <b>${views}</b>
    </p>
    <p class="info-item">
    comments
        <b>${comments}</b>
    </p>
    <p class="info-item">
    downloads
        <b>${downloads}</b>
    </p>
  </div>
</div>`)
.join('')
}