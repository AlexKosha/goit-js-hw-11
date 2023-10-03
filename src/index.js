import { Notify } from "notiflix";
import PhotosApiService from "./js/photos-api";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs ={
    form : document.querySelector(".search-form"),
    gallery : document.querySelector('.gallery'),
    loadMore : document.querySelector('.hidden')
}

const photosApiService = new PhotosApiService();

const galleryModal = new SimpleLightbox('.gallery .gallery__link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

refs.form.addEventListener('submit', onSearch)
refs.loadMore.addEventListener('click', onLoadMore)
refs.gallery.addEventListener('click', onOpenModal)

function onSearch(e){
    e.preventDefault();
    
    refs.loadMore.classList.replace('load-more', 'hidden')

    photosApiService.query = e.currentTarget.elements.searchQuery.value
    photosApiService.resetPage();

    photosApiService.fetchPhotos()
    .then((data) => {
        if (data.totalHits === 0) {
            throw new Error (data.status)
        }
        clearGalleryContainer()
        appendGalleryMarkup(data.hits)

        Notify.info(`Hooray! We found ${data.totalHits} images.`)

        if (photosApiService.page < data.totalHits) {
            refs.loadMore.classList.replace('hidden', 'load-more')
        }
    })
    .catch(err => Notify.failure("Sorry, there are no images matching your search query. Please try again."))

}

function onLoadMore({target}) {
    target.disabled = true;
    
    photosApiService.fetchPhotos()
    .then(data => {
        appendGalleryMarkup(data.hits)
        
        if (photosApiService.page >= 2) {
            Notify.warning("We're sorry, but you've reached the end of search results.")
            refs.loadMore.classList.replace('load-more', 'hidden')   
        }
}).catch(err => console.log(err))
.finally(()=>(target.disabled = false)) ;
}

function smoothScroll() {
    const { height: cardHeight } = refs.gallery
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
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
    smoothScroll();
    galleryModal.refresh();
}

function clearGalleryContainer (){
    refs.gallery.innerHTML = ''
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