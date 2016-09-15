define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var buzz = require('./lib/buzz');

    var SoundManagerView = Backbone.View.extend({

        alreadyPlayed: false,
        soundsList : null,

        initialize: function () {
            this.render();
            var AdaptEvents = {
                "router:location": this.stopAudio,
            };
            this.listenTo(Adapt, AdaptEvents);
        },

        events: {
            "click .sound-manager-extension-button": "onSoundManagerClick",
        },

        preRender: function() { 
        },

        render: function () {
            // Convert model data into JSON
            var data = this.model.toJSON();
            //load sounds(s)
            var sndArray = this.model.get('_sound-manager').sounds;
            var sndList = new Array();
            for(var i=0;i<sndArray.length;i++) {
                if((buzz.isOGGSupported())&&(sndArray[i].ogg!=undefined)&&(sndArray[i].ogg!='')){
                    sndList.push(new buzz.sound(sndArray[i].ogg));
                }
                if((buzz.isMP3Supported())&&(sndArray[i].mp3!=undefined)&&(sndArray[i].mp3!='')){
                    sndList.push(new buzz.sound(sndArray[i].mp3));
                }
                if((buzz.isWAVSupported())&&(sndArray[i].wav!=undefined)&&(sndArray[i].wav!='')){
                    sndList.push(new buzz.sound(sndArray[i].wav));
                }
                if((buzz.isAACSupported())&&(sndArray[i].aac!=undefined)&&(sndArray[i].aac!='')){
                    sndList.push(new buzz.sound(sndArray[i].aac));
                }                
            }
            this.soundsList = sndList;
            var template = Handlebars.templates["sound-manager"];
            this.$el.html(template(data)).appendTo($('.' + this.model.get('_id')));
            _.defer(_.bind(this.postRender, this));
        },

        postRender: function() {
            this.$el.on('inview', _.bind(this.inview, this));
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }
                if (this._isVisibleTop && this._isVisibleBottom) {
                    if(this.model.get('_sound-manager').autoplay){
                        if(!this.alreadyPlayed) {
                           this.playAudio();
                           if(this.model.get('_sound-manager').onlyOnce){
                                this.alreadyPlayed = true;
                           }
                       }
                   }
               }
            }
        },

        onSoundManagerClick: function(event) {
            event.preventDefault();
            this.playAudio();
        },

        playAudio: function() {
            this.stopAudio();
            window.currentList = this.soundsList;
            window.currentList.forEach(function(element, index){
                if(index<window.currentList.length-1){
                    element.bindOnce('ended', function(e){
                        window.currentIndex = index;
                        window.currentList[index+1].play();
                    });
                }
            });
            window.currentIndex = 0;
            window.currentList[0].play();
        },

        stopAudio: function() {
            if(window.currentList != null){
                window.currentList[window.currentIndex].stop();
            }
        }

    });
    
    Adapt.on('componentView:postRender', function(view) {
        if (view.model.has('_sound-manager') && view.model.get('_sound-manager').sounds != undefined && view.model.get('_sound-manager').sounds.length>0) {
            new SoundManagerView({
                model: view.model
            });
        }
    });
});1
