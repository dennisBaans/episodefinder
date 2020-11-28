"use strict";

export class EpisodenFinderView {

    constructor(episodenFinderController){
        this._controller = episodenFinderController;
        this._initDOM(); 
        this._initListeners();   
    }

    rolling(){
        generateEpisode();
        domRolling.style.display = "block";
        domResult.style.display = "none";
        domBtnNav.style.display = "none";
        domBtnRoll.style.display = "none";
        setTimeout( () =>{
            domRolling.style.display = "none";
            domResult.style.display = "block";
            domBtnNav.style.display = "block";
            domBtnRoll.style.display = "block";
        }, 6000 );
    
    }

    renderResult = (episode) => {
        this._domResult.textContent = '';
        let text = document.createTextNode(episode);
        this._domResult.appendChild(text);
    }
    
    renderLists = (episodeListObj) => {
        this._domListBoxOpen.textContent = '';
        this._domListBoxDone.textContent = '';
    
        episodeListObj.openList.forEach( (element, index) => {
            let li = document.createElement('li'); 
            li.addEventListener('click', () => {this._controller.pickEpisode(index);})
            let text = document.createTextNode(element);
            li.appendChild(text);
            this._domListBoxOpen.appendChild(li);   
        });
    
        episodeListObj.doneList.forEach( element => {
            let li = document.createElement('li'); 
            let text = document.createTextNode(element);
            li.appendChild(text);
            this._domListBoxDone.appendChild(li);   
        });
    
    }

    animateRolling = () => {
        this._domRolling.style.display = "block";
        this._domResult.style.display = "none";
        this._domBtnNav.style.display = "none";
        this._domBtnRoll.style.display = "none";
        setTimeout( () =>{
            this._domRolling.style.display = "none";
            this.showResult();
        }, 6000 );
    }

    showResult = () => {
        this._domResult.style.display = "block";
        this._domBtnNav.style.display = "block";
        this._domBtnRoll.style.display = "block";
    }

    _initDOM = () => {
        this._domListBoxOpen = document.getElementsByClassName('list-box-open')[0];
        this._domListBoxDone = document.getElementsByClassName('list-box-done')[0];
        this._domResult = document.getElementsByClassName('result')[0];
        this._domRolling = document.getElementsByClassName('rolling')[0];
        this._domBtnNav = document.getElementsByClassName('btn-nav')[0];
        this._domBtnRoll = document.getElementsByClassName('btn-shuffle')[0];
        this._domBtnAccept = document.getElementsByClassName('btn-accept')[0];
        this._domBtnReset = document.getElementsByClassName('btn-reset')[0];
    }

    _initListeners = () => {
        this._domBtnRoll.addEventListener('click', () => {this._controller.rolling()});
        this._domBtnAccept.addEventListener('click', () => {this._controller.accept()}); 
        this._domBtnReset.addEventListener('click', () => {this._controller.reset()});
    }

}




export class EpisodenFinderController {

    _episodeIndex = 0;
    _episodeListObj = {};
    _episode = '';
    _serie = '';

    constructor(){
        this._view = new EpisodenFinderView(this);
        this._model = new EpisodenFinderModel();
        this._init();
    }

    rolling = () => {  
        this._view.animateRolling();
        this.generateEpisode();
    }

    pickEpisode(index){
        this._episodeIndex = index;
        this._episode = this._episodeListObj.openList[this._episodeIndex];
        this._view.showResult();
        this._view.renderResult(this._episode);    
    }

    accept(){
        if(this._episode != '' || this._episodeIndex != '') {      
            this._episodeListObj.openList.splice(this._episodeIndex, 1);  
            this._episodeListObj.doneList.unshift(this._episode);

            this._model.saveList(this._serie, this._episodeListObj);
            this._view.renderLists(this._episodeListObj);
            this._episode = '';
            this._episodeIndex = '';
        }
        
    }

    reset = async () => {
        if (confirm("Are you sure??")) {
            await this._model.removeList(this._serie);
            this._episodeListObj = await this._model.loadList(this._serie);
            console.log(this._episodeListObj);
            this._view.renderLists(this._episodeListObj);
        }          
    }

    generateEpisode = () => {
        this._episodeIndex = this._getRand(this._episodeListObj.openList.length);
        this._episode = this._episodeListObj.openList[this._episodeIndex];
        this._view.renderResult(this._episode);
    }

    _init = async () => {
        this._serie = await this._model.loadSerie();
        this._episodeListObj = await this._model.loadList(this._serie);
        this._view.renderLists(this._episodeListObj);
    }
    
    _getRand = (max) => {
        return Math.floor(Math.random() * max);
    }


}

export class EpisodenFinderModel {

    _availableSeries = [
        {'id': 'himym', 'name': 'how i met your mother'},
        {'id': 'tbbt', 'name': 'the big bang theory'},
    ];

    constructor(){
        

    }

    getSerieName = (id) => {
        return this._availableSeries.find(obj => obj.id == id);
    }

    _generateSeed = async () => {
        let seeds = {
            "himym": [22,22,20,24,24,24,24,24,24]
        };

        let keys = Object.keys(seeds);
        for (let serie of keys){
            let obj = [];
            seeds[serie].forEach( (episodeCount, s) => {
                for(let e = 0; e < episodeCount; e++){
                    let episode = `Staffel ${s+1} Episode ${e+1}`;
                    obj.push(episode);
                }
            });
    
            if(obj.length != 0){
                await this.saveList(serie, {"openList": obj, "doneList": []});
            }
            
        }
    }

    saveList = (serie, obj) => {
        localStorage.setItem(serie, JSON.stringify(obj))
    }

    loadList = async (key) => {
        if(localStorage.getItem(key) == undefined){
            this._generateSeed();
        } 
        return await JSON.parse(localStorage.getItem(key));
    }

    loadSerie = async () => {
        if(localStorage.getItem('serie') == undefined){
            await localStorage.setItem('serie', this._availableSeries[0].id);
            return this._availableSeries[0].id;
        } 
        return await localStorage.getItem('serie');
    }

    saveSerie = (serie) => {
        localStorage.setItem('serie', serie)
    }

    removeList = (serie) => {
        localStorage.removeItem(serie);
    }


}
