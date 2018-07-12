
	/*
	 * Alternative Fusionmons Random Battle
	 */

	{
		name: "[Gen 7] Alternative Fusionmons Uber",
		desc: ["",],
		mod: 'fusiomons',
		column: 2,
		lr: true,
		fusionmonsRules: {'Alternative':1},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['CAP'],
		onAfterMega: function (pokemon) {
			this.afterMega(pokemon);
		},
		onModifyTemplate: function (template, pokemon) {		
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},

	/*
	 * Fusionmons Random Battle
	 */

	{
		name: "[Gen 7] Fusionmons Random Battle",
		desc: ["Battle of random pokemon fusions"],
		mod: 'fusiomons',
		team: 'random',
		column: 2,
		fusionmonsRules: {'Alternative':0},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
		onAfterMega: function (pokemon) {
			pokemon.removeVolatile('hybride');
			let d=this.data['Pokedex'];
			let name=pokemon.name.substring(1,20);
			let template = this.getTemplate(d[pokemon.speciesid].otherFormes[0]);
			let template2 = this.getTemplate(pokemon.name.substring(1,20));
			if(!template2.exists)
			{
				name=pokemon.species;
				template2 =  template;
			}
			let stats={};
			for(let stat in pokemon.template.baseStats)
				{
				stats[stat]=(d[template.speciesid].baseStats[stat]+d[template2.speciesid].baseStats[stat])/2;
				}
			pokemon.baseStats=this.spreadModify(stats, pokemon.set);
			this.info(pokemon, template2);
		},
		onModifyTemplate: function (template, pokemon) {
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},
	
	/*
	 * Fusionmons
	 */
	{	
		name: "[Gen 7] Fusionmons",
		desc: ["Battle of pokemon fusions",],
		mod: 'fusiomons',
		fusionmonsRules: {'Alternative':0},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['Shadow Tag', 'Arena Trap', 'CAP', 'Gengarite', 'Baton Pass'],
		onAfterMega: function (pokemon) {
			pokemon.removeVolatile('hybride');
			let d=this.data['Pokedex'];
			let name=pokemon.name.substring(1,20);
			let template = this.getTemplate(d[pokemon.speciesid].otherFormes[0]);
			let template2 = this.getTemplate(pokemon.name.substring(1,20));
			if(!template2.exists)
			{
				name=pokemon.species;
				template2 =  template;
			}
			let stats={};
			for(let stat in pokemon.template.baseStats)
				{
				stats[stat]=(d[template.speciesid].baseStats[stat]+d[template2.speciesid].baseStats[stat])/2;
				}
			pokemon.baseStats=this.spreadModify(stats, pokemon.set);
			this.info(pokemon, template2);
		},
		onModifyTemplate: function (template, pokemon) {		
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},
		/*
		* Fusionmons Uber
		*/
	{
		name: "[Gen 7] Fusionmons Uber",
		desc: ["Battle of pokemon fusions",],
		mod: 'fusiomons',
		lr: true,
		fusionmonsRules: {'Alternative':0},
		ruleset: ['Pokemon', 'Fusion', 'Sleep Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['CAP'],
		onAfterMega: function (pokemon) {
			pokemon.removeVolatile('hybride');
			let d=this.data['Pokedex'];
			let name=pokemon.name.substring(1,20);
			let template = this.getTemplate(d[pokemon.speciesid].otherFormes[0]);
			let template2 = this.getTemplate(pokemon.name.substring(1,20));
			if(!template2.exists)
			{
				name=pokemon.species;
				template2 =  template;
			}
			let stats={};
			for(let stat in pokemon.template.baseStats)
				{
				stats[stat]=(d[template.speciesid].baseStats[stat]+d[template2.speciesid].baseStats[stat])/2;
				}
			pokemon.baseStats=this.spreadModify(stats, pokemon.set);
			this.info(pokemon, template2);
		},
		onModifyTemplate: function (template, pokemon) {		
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},
		/*
	     * Double Fusionmons
	    */
	{
		name: "[Gen 7] Double Fusionmons",
		desc: ["Battle of pokemon fusions",],
		mod: 'fusiomons',
		gameType: 'doubles',
		fusionmonsRules: {'Alternative':0},
		ruleset: ['Pokemon', 'Fusion', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Exact HP Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['CAP', 'Gengarite', 'Eevium Z', 'Kangaskhanite', 'Dark Void', 'Gravity ++ Grass Whistle', 'Gravity ++ Hypnosis', 'Gravity ++ Lovely Kiss', 'Gravity ++ Sing', 'Gravity ++ Sleep Powder',],
		onAfterMega: function (pokemon) {
			pokemon.removeVolatile('hybride');
			let d=this.data['Pokedex'];
			let name=pokemon.name.substring(1,20);
			let template = this.getTemplate(d[pokemon.speciesid].otherFormes[0]);
			let template2 = this.getTemplate(pokemon.name.substring(1,20));
			if(!template2.exists)
			{
				name=pokemon.species;
				template2 =  template;
			}
			let stats={};
			for(let stat in pokemon.template.baseStats)
				{
				stats[stat]=(d[template.speciesid].baseStats[stat]+d[template2.speciesid].baseStats[stat])/2;
				}
			pokemon.baseStats=this.spreadModify(stats, pokemon.set);
			this.info(pokemon, template2);
		},
		onModifyTemplate: function (template, pokemon) {
			if(!template.isMega) return this.fuse(template, pokemon);
		},
	},