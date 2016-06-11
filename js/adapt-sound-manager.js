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

        preRender: function() {},

        render: function () {
            // Convert model data into JSON
            var data = this.model.toJSON();
            var template = Handlebars.templates["sound-manager"];
            
            //load sounds(s)
            var sndArray = this.model.get('_sound-manager').sounds;
            this.soundsList = new Array();
            for(var i=0;i<sndArray.length;i++) {
                this.soundsList.push(new Buzz.sound(sndArray[i].src));
            }

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
            var self = this;
            this.soundsList.forEach(function(element, index) {
                if(index<self.soundsList.length-1){
                    element.bind('ended', function(e) {
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
});