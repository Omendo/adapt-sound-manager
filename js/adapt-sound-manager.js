define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var Buzz = require('./lib/buzz');

    var SoundManagerView = Backbone.View.extend({

        alreadyPlayed: false,
        soundsList : null,

        initialize: function () {
            this.render();
        },

        events: {
            "click .sound-manager-extension-button": "onSoundManagerClick"
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
                if((Buzz.isOGGSupported())&&(sndArray[i].ogg!=undefined)&&(sndArray[i].ogg!='')){
                    tmpArray.push(sndArray[i].ogg);
                }
                if((Buzz.isMP3Supported())&&(sndArray[i].mp3!=undefined)&&(sndArray[i].mp3!='')){
                    tmpArray.push(sndArray[i].mp3);
                }
                if((Buzz.isWAVSupported())&&(sndArray[i].wav!=undefined)&&(sndArray[i].wav!='')){
                    tmpArray.push(sndArray[i].wav);
                }
                if((Buzz.isAACSupported())&&(sndArray[i].aac!=undefined)&&(sndArray[i].aac!='')){
                    tmpArray.push(sndArray[i].aac);
                }
                this.soundsList.push(new Buzz.sound(tmpArray, {preload:true, webAudioApi:true}));
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
            var self = this;
            this.soundsList.forEach(function(element, index) {
                if(index<self.soundsList.length-1){
                    element.bindOnce('ended', function(e) {
                        self.soundsList[index+1].play();
                    });
                }
            });
            this.soundsList[0].play();
        }

    });
    
    Adapt.on('componentView:postRender', function(view) {
        if (view.model.has('_sound-manager') && view.model.get('_sound-manager').sounds != undefined) {
            new SoundManagerView({
                model: view.model
            });
        }
    });
});1