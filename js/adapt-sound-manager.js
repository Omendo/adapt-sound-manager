define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var SoundManagerView = Backbone.View.extend({

        alreadyPlayed: false,
        audio: null,

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
            
            this.$el.html(template(data)).appendTo($('.' + this.model.get('_id')));
            _.defer(_.bind(this.postRender, this));
        },

        postRender: function() {
            this.$el.on('inview', _.bind(this.inview, this));
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if(this.model.has('_sound-manager') && this.model.get('_sound-manager').length > 0){
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
                        if((!this.model.get('_sound-manager')[0].onlyOnce)||(!this.alreadyPlayed)){
                            this.playAudio();
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
            if(this.model.has('_sound-manager') && this.model.get('_sound-manager').length > 0){
                if(this.audio != null){
                    this.audio.pause();
                }else{
                    this.audio = new Audio(this.model.get('_sound-manager')[0].file);
                }
                this.audio.currentTime = 0;
                this.audio.play();
            }
        }

    });
    
    Adapt.on('componentView:postRender', function(view) {
        if (view.model.has('_sound-manager') && view.model.get('_sound-manager').length > 0) {
            new SoundManagerView({
                model: view.model
            });
        }
    });
});