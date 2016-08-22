define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var Howler = require('./lib/howler');

    var SoundManagerView = Backbone.View.extend({

        alreadyPlayed: false,
        soundsList : null,
        currentSound: 0,

        initialize: function () {
            this.render();
            var AdaptEvents = {
                "navigation:backButton": this.stopAudio
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
            var template = Handlebars.templates["sound-manager"];

            //load sounds(s)
            var sndArray = this.model.get('_sound-manager').sounds;
            this.soundsList = new Array();
            for(var i=0;i<sndArray.length;i++) {
                var tmpArray = new Array();
                if((sndArray[i].ogg!=undefined)&&(sndArray[i].ogg!='')){
                    tmpArray.push(sndArray[i].ogg);
                }
                if((sndArray[i].mp3!=undefined)&&(sndArray[i].mp3!='')){
                    tmpArray.push(sndArray[i].mp3);
                }
                if((sndArray[i].wav!=undefined)&&(sndArray[i].wav!='')){
                    tmpArray.push(sndArray[i].wav);
                }
                if((sndArray[i].aac!=undefined)&&(sndArray[i].aac!='')){
                    tmpArray.push(sndArray[i].aac);
                }
                var self = this;

                this.soundsList.push(new Howl({
                    urls: tmpArray,
                    buffer: true,
                    onend: function() {
                        if(self.currentSound<self.soundsList.length) {
                            self.playAudio();
                        }else{
                            self.currentSound = 0;
                        }
                    }
                }));
            }

            this.$el.html(template(data)).appendTo($('.' + this.model.get('_id')));
            _.defer(_.bind(this.postRender, this));
        },

        postRender: function() {
            this.$el.on('inview', _.bind(this.inview, this));
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if(this.model.get('_sound-manager').autoplay){
                    if(!this.alreadyPlayed) {
                       this.playAudio();
                       if(this.model.get('_sound-manager').onlyOnce){
                            this.alreadyPlayed = true;
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
            if(window.currentSound != null){
                window.currentSound.stop();
            }
            window.currentSound = this.soundsList[this.currentSound];
            this.soundsList[this.currentSound].stop().play();
            this.currentSound++;
        },

        stopAudio: function() {
            if(window.currentSound != null){
                window.currentSound.stop();
            }
            window.currentSound = null;
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
