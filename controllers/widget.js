var WNAME = 'com.caffeinalab.titanium.musicplayer';
if (Ti.Trimethyl == null) {
	Ti.API.warn(WNAME + ': This widget requires Trimethyl to be installed (https://github.com/CaffeinaLab/Trimethyl)');
}

if (Event == null || !(Event instanceof Backbone.Events)) {
	var Event = require('T/event');
}

/*
Pragma private
*/

Titanium.Media.audioSessionCategory = Titanium.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;

var args 		= arguments[0] || {};
var nowPlaying 	= OS_IOS ? Util.requireOrNull('com.guidolim.TiNowPlaying') : null;
var EVENTS 		= ["play", "pause", "stop", "stopped", "progress", "stopall"];
var LISTENERS	= {};
var E_Bounce 	= [];
var E_PREF 		= "musicplayer.";
var height 		= 70;
var apHasListener = false;
$.ao 			= {};
$.ap 			= {};

if (Alloy.Globals.__comcaffeinatitaniummusicplayer) {
	$.ap = Alloy.Globals.__comcaffeinatitaniummusicplayer.ap;
	$.ao = Alloy.Globals.__comcaffeinatitaniummusicplayer.ao;
	Alloy.Globals.__comcaffeinatitaniummusicplayer.cleanup();
	$.ap.addEventListener("progress", audioProgressHandler);
	apHasListener = true;
} else {
	$.ap 			= Ti.Media.createAudioPlayer({
		allowBackgroud: true
	});
}
Alloy.Globals.__comcaffeinatitaniummusicplayer = $;

function init() {
	if (aoNull()) return;
	if ($.ao.title != $.title.text) {
		$.title.text = $.ao.title || "";
		$.title.text = $.title.text.toUpperCase();
	}
	if ($.ao.artist != $.track.text) {
		$.track.text = $.ao.artist ? $.ao.artist : (L("track") + " " + $.ao.index).toUpperCase();
		$.track.text = $.track.text.toUpperCase();
	}

	$.music_player.height = height;
	if (!apHasListener) {
		apHasListener = true;
		$.ap.addEventListener("progress", audioProgressHandler);
	}
}

function aoNull() {
	return Object.getOwnPropertyNames($.ao).length == 0;
} 

getLocalCoverName = function() {
	return Ti.Utils.md5HexDigest($.ao.cover) + $.ao.cover.match(/\.\w+$/).pop();
};
getLocalCover = function() {
	return Ti.Filesystem.getFile(getLocalDir().resolve(), getLocalCoverName());
};
getLocalDir = function() {
	var dir = Ti.Filesystem.getFile(Util.getAppDataDirectory(), 'audio');
	if (!dir.exists()) dir.createDirectory();
	return dir;
};
downloadCover = function(progressHandler) {
	return Q.promise(function(resolve, reject) {
		if (isDownloadedCover()) return resolve();
		HTTP.download($.ao.cover, getLocalCover(), resolve, reject, progressHandler);
	});
};
isDownloadedCover = function() {
	return getLocalCover().exists();
};
getCover = function() {
	if (!isDownloadedCover()) return $.ao.cover;
	else return getLocalCover().resolve();
};
getCoverNativePath = function() {
	if (!isDownloadedCover()) return false;
	else return getLocalCover().nativePath;
};

//////////////
// Handlers //
//////////////

function remoteControlsHandler(e) {
	switch (e.action) {
		case nowPlaying.PLAY:
			Event.trigger("musicplayer.play", _.extend($.ao), {__through_event: true});
			break;
		case nowPlaying.PAUSE:
			$.pause();
			break;
		case nowPlaying.STOP:
			Event.trigger("musicplayer.stopall",{__through_event: true});
			$.cleanup();
			break;
		case nowPlaying.NEXT:
			Event.trigger("musicplayer.stopall",{__through_event: true});
			$.cleanup();
			break;
		case nowPlaying.PREV:
			Event.trigger("musicplayer.stopall",{__through_event: true});
			$.cleanup();
			break;
	}
}

function setInfo() {
	if (!nowPlaying) return;
	if (aoNull()) return;

	downloadCover()
	.then(function() {		
		nowPlaying.setInfo({
		  artistName: $.ao.artist,
		  songTitle: $.ao.title,
		  albumTitle: $.ao.album,
		  albumCover: getCoverNativePath()
		});
		nowPlaying.addEventListener("RemoteControl", remoteControlsHandler);
	});
}

function clearInfo() {
	if (!nowPlaying) return;

	nowPlaying.clear();
}

function stop() {
	if ($.ap.playing || $.ap.paused)
    {
		$.playBtn.image = WPATH("/images/play.png");
        $.ap.stop();
        if (OS_ANDROID) $.ap.release();
    }
}

function toggleMusic() {
	if (aoNull()) return;
	if ($.ap.playing) return $.ap.pause();
	if ($.ap.getUrl() == $.ao.url) return $.ap.play();

	$.ap.setUrl($.ao.url);
	$.ap.play();
	setInfo();
}

function progressToPercent(progress) {
	return (progress/$.ap.duration) * 100;
}

function audioProgressHandler(e) {
	$.ao = _.extend($.ao, {
		percentage: progressToPercent(e.progress),
		progress: e.progress,
		new: e.url == $.ao.url
	});
	Event.trigger(E_PREF + EVENTS[4], $.ao);
}

/*
Listeners
*/

$.playBtn.addEventListener("click", function() {
	if ($.ap.playing) $.pause();
	else $.play();
});

/*
Pragma public
*/

/**
 * @method play
 * audio object
 * @param  {Object} audioObject
 */
$.play = function(audioObject) {
	if (!audioObject && aoNull()) return Ti.API.warn("Called play without an audioObject");

	if (audioObject != null && (audioObject.url != $.ao.url)) {
		Event.trigger(E_PREF + EVENTS[5], {});
		$.ao = audioObject;
		init();
	}
	$.playBtn.image = WPATH("/images/pause.png");
	if (!audioObject || !audioObject.__through_event) Event.trigger(E_PREF + EVENTS[0], $.ao);
	toggleMusic();
};

/**
 * @method pause
 * audio object
 * @param  {Object} audioObject
 */
$.pause = function(e) {
	if ($.ap && $.ap.paused) return;
	$.playBtn.image = WPATH("/images/play.png");
	if (!e || !e.__through_event) Event.trigger(E_PREF + EVENTS[1], $.ao);
	else toggleMusic();
};

/**
 * @method stop
 * audio object
 * @param  {Object} audioObject
 */
$.stop = function(e) {
	$.playBtn.image = WPATH("/images/play.png");
	$.music_player.height = 0;
	if (!e || !e.__through_event) {
		Event.trigger(E_PREF + EVENTS[2], $.ao);
		$.cleanup();
	}
	clearInfo();
	stop();
};

/**
 * @method progress
 * audio object
 * @param  {Object} audioObject
 */
$.progress = function(e) {
	init();

	$.playBtn.image = WPATH("/images/pause.png");
	$.progressbar.width = $.ao.percentage + "%";
	if ($.ao.percentage > 98) $.stop({__through_event: true});
	$.ao.__through_event = false;
};

$.stopall = function() {
	return $.stop({__through_event: true});
};

/**
 * @method cleanup removes all listeners and cleans memory
 */
$.cleanup = function() {
	$.ap.removeEventListener("progress", audioProgressHandler);
	EVENTS.forEach(function(k) {
		var functions = Object.getOwnPropertyNames($).filter(function(k) { 
			return _.isFunction($[k]);
		});
		if (functions.indexOf(k)) {
			Event.off(E_PREF + k, LISTENERS[E_PREF + k]);
		}
	});
};

(function setListeners() {
	EVENTS.forEach(function(k) {
		var functions = Object.getOwnPropertyNames($).filter(function(k) { 
			return _.isFunction($[k]);
		});
		if (functions.indexOf(k) != -1) {
			LISTENERS[E_PREF + k] = function(e) {
				if (_.isFunction($[k])) $[k](_.extend(e, {__through_event: true}));
			};
			Event.on(E_PREF + k, LISTENERS[E_PREF + k]);
		}
	});
})();