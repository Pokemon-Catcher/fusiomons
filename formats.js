
	{
		name: "[Gen 7] Fusionmons Random Battle",
		desc: ["Battle of random pokemon fusions"],
		mod: 'fusiomons',
		team: 'random',
		column: 2,
		fusionmonsRules: {'Alternative':1},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
		onAfterMega: function (pokemon) {
			this.afterMega(pokemon);
		},
		onModifyTemplate: function (template, pokemon) {
			if(!this.fuse) return;
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},
	{
		name: "[Gen 7] Fusionmons Uber",
		desc: ["Battle of pokemon fusions",],
		mod: 'fusiomons',
		lr: true,
		fusionmonsRules: {'Alternative':1},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['CAP'],
		onAfterMega: function (pokemon) {
			this.afterMega(pokemon);
		},
		onModifyTemplate: function (template, pokemon) {
			if(!this.fuse) return;
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},
		{
		name: "[Gen 7] Double Fusionmons",
		desc: ["Battle of pokemon fusions",],
		mod: 'fusiomons',
		gameType: 'doubles',
		fusionmonsRules: {'Alternative':1},
		ruleset: ['Pokemon', 'Fusion', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['CAP', 'Gengarite', 'Eevium Z', 'Kangaskhanite', 'Dark Void', 'Gravity ++ Grass Whistle', 'Gravity ++ Hypnosis', 'Gravity ++ Lovely Kiss', 'Gravity ++ Sing', 'Gravity ++ Sleep Powder',],
		onAfterMega: function (pokemon) {
			this.afterMega(pokemon);
		},
		onModifyTemplate: function (template, pokemon) {
			if(!this.fuse) return;
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},