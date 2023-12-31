import axios from "axios"

const BASE_URL = 'https://pixabay.com/api/'
const API_KEY = '39799676-ffca3689f9c6f15d7ef094ccc'
    
        

export default class PhotosApiService {
    constructor(){
        this.searchQuery = ''
        this._page = 1
        this.per_page = 40;
        this.totalHits = 1;
    }

   async fetchPhotos(){ 

    const options = new URLSearchParams({
        key : API_KEY,
        q : this.searchQuery,
        per_page: this.per_page,
        page : this.page,
        image_type :"photo",
        orientation :"horizontal",
        safesearch: "true"
    });
    
        try{
            const response = await axios.get(`${BASE_URL}?${options}`)
            return await response.data ;
        }catch(error){
            console.log('catch')
            return [];
        }
    }

    maxPage (){
        return  Math.ceil(this.totalHits / this.per_page)
    }

    incrementPage(){
        this._page +=1
    }

    resetPage(){
        this._page = 1
    }

    get page(){
        return this._page
    }

    set page(newPage){
        this._page = newPage;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery){
        this.searchQuery = newQuery;
    }

    get total(){
        return this.totalHits
    }

    set total(newTotal){
        this.totalHits = newTotal
    }

}