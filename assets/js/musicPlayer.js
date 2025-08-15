
// Player
var Player = function() {
    var _this = this,
    $playerAll = $('[data-player]'),
    $playerCurrent = null,
    $displayArtistName = null,
    $displayAlbumName = null,
    $displaySongName = null,
    $controlPrev = $('[data-player-prev]'),
    $controlPlay = $('[data-player-play]'),
    $controlNext = $('[data-player-next]'),
    index = 0,
    path = {
        audio: 'https://doxxus.com/infinityroad/assets/audio/'
    },
    playing = false,
    playlist = null,
    audio = null;

    _this.methods = {
        init: function() {
            _this.methods.bindUserEvents();
        },
        bindUserEvents: function() {

            $playerAll.on('click', function() {

                if ( !$(this).hasClass('player--open') ) {

                    // pause the current player
                    if (audio !== null) { 
                        audio.pause(); 
                        $playerCurrent.removeClass('player--open player--playing');
                    }

                    // get new player
                    $playerCurrent = $(this);
                    index = $playerCurrent.data('track');

                    // retrieve display elements
                    $displayArtistName = $playerCurrent.find('[data-player-album-artist]');
                    $displayAlbumName = $playerCurrent.find('[data-player-album-name]'),
                    $displaySongName = $playerCurrent.find('[data-player-album-song]');

                    // Audio
                    playlist = playlists[$playerCurrent.data('playlist')];
                    audio = $playerCurrent.find('audio').get(0);
                    audio.addEventListener('ended', function() { 
                        _this.methods.nextTrack();
                    });
                    if (!audio.src) { _this.methods.loadTrack(0); }
                    _this.methods.playTrack();

                    $playerCurrent.toggleClass('player--open');

                }

            });

            $controlPlay.on('click', function() {

                if ($playerCurrent.hasClass('player--playing')) {
                    _this.methods.pauseTrack();
                } else {
                    _this.methods.playTrack();
                }

            }); 

            $controlNext.on('click', function() {
                _this.methods.nextTrack();
            }); 

            $controlPrev.on('click', function() {
                _this.methods.prevTrack();
            }); 

        },
        loadTrack: function() {
            audio.src = 'https://doxxus.com/infinityroad/assets/audio/'
            $displayArtistName.text(playlist.tracks[index].artist);
            $displayAlbumName.text(playlist.tracks[index].album);
            $displaySongName.text(playlist.tracks[index].song);
            $playerCurrent.data('track', index);
        },
        playTrack: function() {
            $playerCurrent.addClass('player--playing');
            playing = true;
            audio.play();
        },
        pauseTrack: function() {
            $playerCurrent.removeClass('player--playing');
            playing = false;
            audio.pause();
        },
        nextTrack: function() {

            if ((index + 1) < playlist.trackCount) {
                index++;
            } else {
                index = 0;
            }

            _this.methods.loadTrack(index);

            if (playing) {
                audio.play();
            }

        },
        prevTrack: function() {

            if ((index - 1) > -1) {
                index--;
            } else {
                index = (playlist.trackCount - 1);
            }

            _this.methods.loadTrack(index);

            if (playing) {
                audio.play();
            }

        }
    };

    return _this.methods;

};

// Load
$(function() {
    player = new Player();
    player.init();
});

// Data
var playlists = {
    boxer:  {
        slug: 'sabbath',
        trackCount: 2,
        tracks: [
            {
                "track": 1,
                "artist": "Black Sabbath",
                "album": "Paranoid",
                "song": "Paranoid",
                "file": "black-sabbath-paranoid.mp3"
            }, {
                "track": 1,
                "artist": "The National",
                "album": "Boxer",
                "song": "Mistaken For Strangers",
                "file": "mistaken-for-strangers.mp3"
            }
        ]
    }
}