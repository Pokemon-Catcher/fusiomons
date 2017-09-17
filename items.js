'use strict';

exports.BattleItems = {
	"eviolite": {
		id: "eviolite",
		name: "Eviolite",
		spritenum: 130,
		fling: {
			basePower: 40,
		},
		onModifyDefPriority: 2,
		onModifyDef: function (def, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.nfe&template2.nfe) {
				return this.chainModify(1.5);
			}
			else if(pokemon.baseTemplate.nfe|template2.nfe)
			{
				return this.chainModify(1.25);
			}
		},
		onModifySpDPriority: 2,
		onModifySpD: function (spd, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.nfe&template2.nfe) {
				return this.chainModify(1.5);
			}
			else if(pokemon.baseTemplate.nfe|template2.nfe)
			{
				return this.chainModify(1.25);
			}
		},
		num: 538,
		gen: 5,
		desc: "If holder's species can evolve, its Defense and Sp. Def are 1.5x.",
		//desc: "If holder's species can evolve, its Defense and Sp. Def are 1.5x. If one of fusion's species can evolve, its Defense and Sp. Def are 1.25x.",	
	},
	"thickclub": {
		id: "thickclub",
		name: "Thick Club",
		spritenum: 491,
		fling: {
			basePower: 90,
		},
		onModifyAtkPriority: 1,
		onModifyAtk: function (atk, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if ((pokemon.baseTemplate.baseSpecies === 'Cubone' || pokemon.baseTemplate.baseSpecies === 'Marowak')&(template2.baseSpecies === 'Cubone' || template2.baseSpecies === 'Marowak')) {
				return this.chainModify(2);
			}
			else if((pokemon.baseTemplate.baseSpecies === 'Cubone' || pokemon.baseTemplate.baseSpecies === 'Marowak')|template2.baseSpecies === 'Cubone' || template2.baseSpecies === 'Marowak'){
				return this.chainModify(3,2);
			}
		},
		num: 258,
		gen: 2,
		desc: "If holder is a Cubone or a Marowak, its Attack is doubled.",
		//desc: "If holder is a Cubone or a Marowak, its Attack is doubled. If holder's fusion consists a Cubone or a Marowak, its Attack increases by 1.5.",
	},		
	"lightball": {
		id: "lightball",
		name: "Light Ball",
		spritenum: 251,
		fling: {
			basePower: 30,
			status: 'par',
		},
		onModifyAtkPriority: 1,
		onModifyAtk: function (atk, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu'&&template2.baseSpecies=== 'Pikachu') {
				return this.chainModify(2);
			} else if (pokemon.baseTemplate.baseSpecies === 'Pikachu'||template2.species=== 'Pikachu') {
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 1,
		onModifySpA: function (spa, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu'&template2.species=== 'Pikachu') {
				return this.chainModify(2);
			} else if (pokemon.baseTemplate.baseSpecies === 'Pikachu'||template2.species=== 'Pikachu') {
				return this.chainModify(3,2);
			}
		},
		num: 236,
		gen: 2,
		desc: "If holder is a Pikachu, its Attack and Sp. Atk are doubled.",
		//desc: "If holder is a Pikachu, its Attack and Sp. Atk are doubled. If holder's fusion consists a Pikachu, its Attack and Sp. Atk are 1.5x.",
	},
	"stick": {
		id: "stick",
		name: "Stick",
		fling: {
			basePower: 60,
		},
		spritenum: 475,
		onModifyCritRatio: function (critRatio, user) {
			let name=user.species;
			let template2 = user.baseTemplate;
				if(user.name !== undefined) {
					name=user.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=user.species;
					template2 =  user.baseTemplate;
				}
			if (user.baseTemplate.species === 'Farfetch\'d'&template2.species === 'Farfetch\'d') {
				return critRatio + 2;
			} else if(user.baseTemplate.species === 'Farfetch\'d'|template2.species === 'Farfetch\'d') {
				return critRatio + 1;
			}
		},
		num: 259,
		gen: 2,
		desc: "If holder is a Farfetch'd, its critical hit ratio is raised by 2 stages.",
		//desc: "If holder is a Farfetch'd, its critical hit ratio is raised by 2 stages. If holder's fusion consists a Farfetch'd, its critical hit ratio is raised by 1 stages.",
	},
	"deepseascale": {
		id: "deepseascale",
		name: "Deep Sea Scale",
		spritenum: 93,
		fling: {
			basePower: 30,
		},
		onModifySpDPriority: 2,
		onModifySpD: function (spd, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.species === 'Clamperl'&template2.species === 'Clamperl') {
				return this.chainModify(2);
			}
			else if(pokemon.baseTemplate.species === 'Clamperl'|template2.species === 'Clamperl')
			{
				return this.chainModify(1.5);
			}
		},
		num: 227,
		gen: 3,
		desc: "If holder is a Clamperl, its Sp. Def is doubled.",
	},
	"deepseatooth": {
		id: "deepseatooth",
		name: "Deep Sea Tooth",
		spritenum: 94,
		fling: {
			basePower: 90,
		},
		onModifySpAPriority: 1,
		onModifySpA: function (spa, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.species === 'Clamperl'&template2.species === 'Clamperl') {
				return this.chainModify(2);
			}
			else if(pokemon.baseTemplate.species === 'Clamperl'|template2.species === 'Clamperl')
			{
				return this.chainModify(1.5);
			}
		},
		num: 226,
		gen: 3,
		desc: "If holder is a Clamperl, its Sp. Atk is doubled.",
	},
	"souldew": {
		id: "souldew",
		name: "Soul Dew",
		spritenum: 459,
		fling: {
			basePower: 30,
		},
		onBasePowerPriority: 6,
		onBasePower: function (basePower, user, target, move) {
			let name=user.species;
			let template2 = user.baseTemplate;
				if(user.name !== undefined) {
					name=user.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=user.species;
					template2 =  user.baseTemplate;
				}
			if (move && ((user.baseTemplate.num === 380 || user.baseTemplate.num === 381)&&(template2.num === 380 || template2.num === 381)) && (move.type === 'Psychic' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			} else if(move && ((user.baseTemplate.num === 380 || user.baseTemplate.num === 381)|(template2.num === 380 || template2.num === 381)) && (move.type === 'Psychic' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x2000]);
			}
		},
		num: 225,
		gen: 3,
		desc: "If holder's a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.",
	},
	"adamantorb": {
		id: "adamantorb",
		name: "Adamant Orb",
		spritenum: 4,
		fling: {
			basePower: 60,
		},
		onBasePowerPriority: 6,
		onBasePower: function (basePower, user, target, move) {
			let name=user.species;
			let template2 = user.baseTemplate;
			if(user.name !== undefined) {
				name=user.name.substring(1,20);
				template2 = this.getTemplate(name);
			}
			if(!template2.exists) {
				name=user.species;
				template2 =  user.baseTemplate;
			}
			if (move && user.baseTemplate.species === 'Dialga'&&template2.species === 'Dialga' && (move.type === 'Steel' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			} else if(move && (user.baseTemplate.species === 'Dialga'||template2.species === 'Dialga') && (move.type === 'Steel' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x2000]);
			}
		},
		num: 135,
		gen: 4,
		desc: "If holder is a Dialga, its Steel- and Dragon-type attacks have 1.2x power.",
	},
		"metalpowder": {
		id: "metalpowder",
		name: "Metal Powder",
		fling: {
			basePower: 10,
		},
		spritenum: 287,
		onModifyDefPriority: 2,
		onModifyDef: function (def, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.species === 'Ditto'&template2.species === 'Ditto' && !pokemon.transformed) {
				return this.chainModify(2);
			}
			else if(pokemon.baseTemplate.species === 'Ditto'|template2.species === 'Ditto' && !pokemon.transformed)
			{
				return this.chainModify(1.5);
			}
		},
		num: 257,
		gen: 2,
		desc: "If holder is a Ditto that hasn't Transformed, its Defense is doubled.",
	},
		"quickpowder": {
		id: "quickpowder",
		name: "Quick Powder",
		spritenum: 374,
		fling: {
			basePower: 10,
		},
		onModifySpe: function (spe, pokemon) {
			let name=pokemon.species;
			let template2 = pokemon.baseTemplate;
				if(pokemon.name !== undefined) {
					name=pokemon.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=pokemon.species;
					template2 =  pokemon.baseTemplate;
				}
			if (pokemon.baseTemplate.species === 'Ditto'&template2.species === 'Ditto' && !pokemon.transformed) {
				return this.chainModify(2);
			}
			else if(pokemon.baseTemplate.species === 'Ditto'|template2.species === 'Ditto' && !pokemon.transformed)
			{
				return this.chainModify(1.5);
			}
		},
		num: 274,
		gen: 4,
		desc: "If holder is a Ditto that hasn't Transformed, its Speed is doubled.",
	},
		"luckypunch": {
		id: "luckypunch",
		name: "Lucky Punch",
		spritenum: 261,
		fling: {
			basePower: 40,
		},
		onModifyCritRatio: function (critRatio, user) {
				let name=user.species;
			let template2 = user.baseTemplate;
				if(user.name !== undefined) {
					name=user.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=user.species;
					template2 =  user.baseTemplate;
				}
			if (user.baseTemplate.species === 'Chansey'&template2.species === 'Chansey') {
				return critRatio + 2;
			} else if(user.baseTemplate.species === 'Chansey'|template2.species === 'Chansey') {
				return critRatio + 1;
			}
		},
		num: 256,
		gen: 2,
		desc: "If holder is a Chansey, its critical hit ratio is raised by 2 stages.",
	},
		"lustrousorb": {
		id: "lustrousorb",
		name: "Lustrous Orb",
		spritenum: 265,
		fling: {
			basePower: 60,
		},
		onBasePowerPriority: 6,
		onBasePower: function (basePower, user, target, move) {
						let name=user.species;
			let template2 = user.baseTemplate;
			if(user.name !== undefined) {
				name=user.name.substring(1,20);
				template2 = this.getTemplate(name);
			}
			if(!template2.exists) {
				name=user.species;
				template2 =  user.baseTemplate;
			}
			if (move && user.baseTemplate.species === 'Palkia'&&template2.species === 'Palkia' && (move.type === 'Water' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			} else if(move && (user.baseTemplate.species === 'Palkia'||template2.species === 'Palkia') && (move.type === 'Water' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x2000]);
			}
		},
		num: 136,
		gen: 4,
		desc: "If holder is a Palkia, its Water- and Dragon-type attacks have 1.2x power.",
	},
		"griseousorb": {
		id: "griseousorb",
		name: "Griseous Orb",
		spritenum: 180,
		fling: {
			basePower: 60,
		},
		onBasePowerPriority: 6,
		onBasePower: function (basePower, user, target, move) {
			let name=user.species;
			let template2 = user.baseTemplate;
				if(user.name !== undefined) {
					name=user.name.substring(1,20);
					template2 = this.getTemplate(name);
				}
				if(!template2.exists) {
					name=user.species;
					template2 =  user.baseTemplate;
				}
			if (move && user.baseTemplate.num === 487 && template2.num === 487 && (move.type === 'Ghost' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			} else if(move && user.baseTemplate.num === 487|template2.num === 487  && (move.type === 'Ghost' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x2000]);
			}
		},
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 487) || pokemon.baseTemplate.num === 487) {
				return false;
			}
			return true;
		},
		forcedForme: "Giratina-Origin",
		num: 112,
		gen: 4,
		desc: "If holder is a Giratina, its Ghost- and Dragon-type attacks have 1.2x power.",
	},
};
