new Vue({
	el: '#app',
	data: {
		'sessionSetting': 15,
		'breakSetting': 5,		
		'clockTimer': null,
		'clockSession': null,
		'clockBreak': null,
		'status': 'session'
	},
	
	computed: {
		clockTimerDisplay: function() {
			if(this.status === 'session') {
				if(this.clockSession === null) {
					return moment(this.sessionSetting, 'm').format('mm:ss');
				}
				else {
					return this.clockSession.format('mm:ss');
				}
			}
			else if(this.status === 'break time') {
				return this.clockBreak.format('mm:ss');
			}
		},
		
		progressStyle: function() {
			var styleObj = {};
			if(this.clockSession !== null || this.clockBreak !== null) {				
				if(this.status === 'session') {
					var splitClockTime = this.clockSession.format('m.ss').split('.');					
					var clockTimeSeconds = (+splitClockTime[0]) * 60 + (+splitClockTime[1]);
					var sessionSettingSeconds = this.sessionSetting * 60;					
					
					styleObj.width = Math.abs((clockTimeSeconds / sessionSettingSeconds) * 100 - 100) + '%';
				}
				else if(this.status === 'break time') {
					var splitClockTime = this.clockBreak.format('m.ss').split('.');					
					var clockTimeSeconds = (+splitClockTime[0]) * 60 + (+splitClockTime[1]);
					var breakSettingSeconds = this.breakSetting * 60;					
					
					styleObj.width = Math.abs((clockTimeSeconds / breakSettingSeconds) * 100 - 100) + '%';
				}
			}
			
			styleObj.background = (this.status === 'session') ? '#1B5E20' : '#B71C1C';
			
			return styleObj;
		},		
	},
	
	methods: {
		addSessionTime: function() {
			this.sessionSetting++;	
			this.cleanUpClock();
		},
		removeSessionTime: function() {				
			this.sessionSetting > 1 && this.sessionSetting--;
			this.cleanUpClock();
		},
		addBreakTime: function() {
			this.breakSetting++;
			this.cleanUpClock();
		},
		removeBreakTime: function() {
			this.breakSetting > 1 && this.breakSetting--;
			this.cleanUpClock();
		},
		
		toggleClock: function() {			
			this.clockSession = this.clockSession || moment(this.sessionSetting, 'm');
			this.clockBreak = this.clockBreak || moment(this.breakSetting, 'm');
			
			if(this.clockTimer === null) {
				this.clockTimer = setInterval(this.runClock, 1000);
			}
			else {				
				clearInterval(this.clockTimer);
				this.clockTimer = null;
			}
		},
		
		runClock: function() {			
			if(this.clockSession.minutes() > 0 || this.clockSession.seconds() > 0) {
				this.status = 'session';
				this.clockSession = moment(this.clockSession).subtract(1, 's');
			}
			else {
				if(this.clockBreak.minutes() > 0 || this.clockBreak.seconds() > 0) {					
					this.status = 'break time';
					this.clockBreak = moment(this.clockBreak).subtract(1, 's');
				}
				else {	
						this.resetClock();	
				}
			}			
		},
		
		resetClock: function() {			
			this.cleanUpClock();
			this.stopTimer();
			this.toggleClock();
		},
		
		stopTimer: function() {
			clearInterval(this.clockTimer);
			this.clockTimer = null;
		},
		
		cleanUpClock: function() {
			this.clockSession = null;
			this.clockBreak = null;
		}
	},
	
	filters: {
		showMinutesSeconds: function(minutes) {
			return moment(minutes, 'm').format('mm:ss');
		},		
	}
});