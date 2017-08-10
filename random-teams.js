'use strict';
 
const RandomTeams = require('../../data/random-teams');
 
class RandomFusionTeams extends RandomTeams {
    randomTeam() {
		let excludedTiers = {'NFE':1,'LC Uber':1, 'LC':1};
		let allowedNFE = {'Chansey':1, 'Doublade':1, 'Gligar':1, 'Porygon2':1, 'Scyther':1, 'Togetic':1,'Dusclops':1,'Yanma':1};
		let team = [];
		let natures = Object.keys(this.data.Natures);
		let items = Object.keys(this.data.Items);
		let teamDetails={};
		let pokemonPool = [];
		for (let id in this.data.FormatsData) 
			{
			let templated = this.getTemplate(id);
			if (templated.gen <= this.gen && !excludedTiers[templated.tier] && !templated.isMega && !templated.isPrimal && !templated.isNonstandard && templated.randomBattleMoves) 
				{
				pokemonPool.push(id);
				}	
			}
		let potd;
		if (Config.potd && 'Rule:potd' in this.getBanlistTable(this.getFormat())) {
			potd = this.getTemplate(Config.potd);
		}
		let typeCount = {};
		let typeComboCount = {};
		let baseFormes = {};
		let uberCount = 0;
		let puCount = 0;
		//One mega per Team
		let megaCount = 0;
		
		let i=0;

		while (pokemonPool.length && team.length < 6) {
		let template = this.getTemplate(this.sampleNoReplace(pokemonPool));
		let template2 = this.getTemplate(this.sampleNoReplace(pokemonPool));
		let species = template.species;
		let species2 = template2.species;
		if (!template.exists) continue;

		// Limit to one of each species (Species Clause)
		if (baseFormes[template.baseSpecies]) continue;

		// Only certain NFE Pokemon are allowed
		if (template.evos.length && !allowedNFE[template.species]) continue;

		let tier = template.tier;
		let tier2 = template2.tier;
		switch (tier) {
		case 'Uber':
			// Ubers are limited to 2 but have a 20% chance of being added anyway.
			if (uberCount > 2 && this.random(5) >= 1) continue;
			break;
		case 'PU':
			// PUs are limited to 2 but have a 20% chance of being added anyway.
			if (puCount > 2 && this.random(5) >= 1) continue;
			break;
		}
		switch (tier2) {
		case 'Uber':
			// Ubers are limited to 2 but have a 20% chance of being added anyway.
			if (uberCount > 2 && this.random(5) >= 1) continue;
			break;
		case 'PU':
			// PUs are limited to 2 but have a 20% chance of being added anyway.
			if (puCount > 2 && this.random(5) >= 1) continue;
			break;
		}

		// Adjust rate for species with multiple formes
		switch (template.baseSpecies) {
		case 'Arceus': case 'Silvally':
			if (this.random(18) >= 1) continue;
			break;
		case 'Pikachu':
			if (this.random(7) >= 1) continue;
			continue;
		case 'Genesect':
			if (this.random(5) >= 1) continue;
			break;
		case 'Castform': case 'Gourgeist': case 'Oricorio':
			if (this.random(4) >= 1) continue;
			break;
		case 'Basculin': case 'Cherrim': case 'Greninja': case 'Hoopa': case 'Meloetta': case 'Meowstic':
			if (this.random(2) >= 1) continue;
			break;
		}

		if (potd && potd.exists) {
			// The Pokemon of the Day belongs in slot 2
			if (team.length === 1) {
				template = potd;
				if (template.species === 'Magikarp') {
					template.randomBattleMoves = ['bounce', 'flail', 'splash', 'magikarpsrevenge'];
				} else if (template.species === 'Delibird') {
					template.randomBattleMoves = ['present', 'bestow'];
				}
			} else if (template.species === potd.species) {
				continue; // No thanks, I've already got one
			}
			}

			let set = this.randomSet(template, template2, i, teamDetails);


			let ability = set.ability;

			let item = '';
			item=set.item;
			// Make sure forme is legal
			if (template.battleOnly || template.requiredItems && !template.requiredItems.some(req => toId(req) === item)) {
				template = this.getTemplate(template.baseSpecies);
				species = template.name;
			}
			if(template2.battleOnly)
			{
			template2 = this.getTemplate(template2.baseSpecies);
			species2 = template2.name;
			}

			// Make sure that a base forme does not hold any forme-modifier items.
			let itemData = this.getItem(item);
			if (itemData.forcedForme && species === this.getTemplate(itemData.forcedForme).baseSpecies) {
				do {
					item = items[this.random(items.length)];
					itemData = this.getItem(item);
				} while (itemData.gen > this.gen || itemData.isNonstandard || itemData.forcedForme && species === this.getTemplate(itemData.forcedForme).baseSpecies);
			}



			// Four random unique moves from the movepool
			let incompatibleMoves = ['bellydrum', 'swordsdance', 'calmmind', 'nastyplot','dragondance','quiverdance','shiftgear','shellsmash','honeclaws','tailglow','workup','growth','sharpen','curse','coil','bulkup'];
			let moves=set.moves;
			let move;
			let moved;
			
			let intersectMoves = moves.filter(moved => incompatibleMoves.includes(moved));
			if (intersectMoves.length > 1) continue;

			let types = [template.types[0],template2.types[1]!=undefined?template2.types[1]:template2.types[0]] ;
				let skip = false;
				for (let t = 0; t < types.length; t++) 
				{
					if (typeCount[types[t]] > 1 && this.random(5) >= 1) 
					{
						skip = true;
						break;
					}
				}
			if (skip) continue;


			// Limit 1 of any type combination, 2 in monotype
			let typeCombo = types.slice().sort().join();
			if (set.ability === 'Drought' || set.ability === 'Drizzle' || set.ability === 'Sand Stream') {
				// Drought, Drizzle and Sand Stream don't count towards the type combo limit
				typeCombo = set.ability;
				if (typeCombo in typeComboCount) continue;
			} else {
				if (typeComboCount[typeCombo] >= 1) continue;
			}

			let nature = set.nature;

			// Level balance--calculate directly from stats rather than using some silly lookup table
			let mbstmin = 1307; // Sunkern has the lowest modified base stat total, and that total is 807
			let stats={};
			for(let statName in template.baseStats)
			{
			stats[statName] = (template.baseStats[statName]+template2.baseStats[statName])/2;
			}
			// If Wishiwashi, use the school-forme's much higher stats
			if (template.baseSpecies === 'Wishiwashi') stats = Dex.getTemplate('wishiwashischool').baseStats;

			// Modified base stat total assumes 31 IVs, 85 EVs in every stat
			let mbst = (stats["hp"] * 2 + 31 + 21 + 100) + 10;
			mbst += (stats["atk"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["def"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spa"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spd"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spe"] * 2 + 31 + 21 + 100) + 5;

			let level = Math.floor(100 * mbstmin / mbst); // Initial level guess will underestimate

			while (level < 100) {
				mbst = Math.floor((stats["hp"] * 2 + 31 + 21 + 100) * level / 100 + 10);
				mbst += Math.floor(((stats["atk"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100); // Since damage is roughly proportional to level
				mbst += Math.floor((stats["def"] * 2 + 31 + 21 + 100) * level / 100 + 5);
				mbst += Math.floor(((stats["spa"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
				mbst += Math.floor((stats["spd"] * 2 + 31 + 21 + 100) * level / 100 + 5);
				mbst += Math.floor((stats["spe"] * 2 + 31 + 21 + 100) * level / 100 + 5);

				if (mbst >= mbstmin) break;
				level++;
			}

			let evs=set.evs;
			let ivs=set.ivs;
			// Random gender--already handled by PS

			// PINGAS
			let happiness = 256;

			// Random shininess
			let shiny = !this.random(1024);

			//Counters
			if(item.megaStone)megaCount++;
			if(megaCount>1) {megaCount=1;continue;}
			if (item.megaStone) teamDetails['megaStone'] = 1;
			if (item.zMove) teamDetails['zMove'] = 1;
			if (ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (ability === 'Drizzle' || moves.includes('raindance')) teamDetails['rain'] = 1;
			if (ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (moves.includes('defog') || moves.includes('rapidspin')) teamDetails['hazardClear'] = 1;
			baseFormes[template.baseSpecies] = 1;

			// Increment type counters
			for (let t = 0; t < types.length; t++) {
				if (types[t] in typeCount) {
					typeCount[types[t]]++;
				} else {
					typeCount[types[t]] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Increment Uber/PU counters
			if (tier === 'Uber'|tier2 === 'Uber') {
				uberCount++;
			} else if (tier === 'PU'|tier2 === 'PU') {
				puCount++;
			}
			i++;

			team.push({
				name: '+'+template2.speciesid,
				species: template.species,
				item: item,
				ability: ability,
				moves: moves,
				evs: evs,
				ivs: ivs,
				nature: nature,
				level: level,
				happiness: happiness,
				shiny: shiny,
			});
		}{
		let excludedTiers = {'NFE':1,'LC Uber':1, 'LC':1};
		let allowedNFE = {'Chansey':1, 'Doublade':1, 'Gligar':1, 'Porygon2':1, 'Scyther':1, 'Togetic':1,'Dusclops':1,'Yanma':1};
		let team = [];
		let natures = Object.keys(this.data.Natures);
		let items = Object.keys(this.data.Items);
		let teamDetails={};
		let pokemonPool = [];
		for (let id in this.data.FormatsData) 
			{
			let templated = this.getTemplate(id);
			if (templated.gen <= this.gen && !excludedTiers[templated.tier] && !templated.isMega && !templated.isPrimal && !templated.isNonstandard && templated.randomBattleMoves) 
				{
				pokemonPool.push(id);
				}	
			}
		let potd;
		if (Config.potd && 'Rule:potd' in this.getBanlistTable(this.getFormat())) {
			potd = this.getTemplate(Config.potd);
		}
		let typeCount = {};
		let typeComboCount = {};
		let baseFormes = {};
		let uberCount = 0;
		let puCount = 0;
		//One mega per Team
		let megaCount = 0;
		
		let i=0;

		while (pokemonPool.length && team.length < 6) {
		let template = this.getTemplate(this.sampleNoReplace(pokemonPool));
		let template2 = this.getTemplate(this.sampleNoReplace(pokemonPool));
		let species = template.species;
		let species2 = template2.species;
		if (!template.exists) continue;
		

		// Limit to one of each species (Species Clause)
		if (baseFormes[template.baseSpecies]) continue;
		// Only certain NFE Pokemon are allowed
		if (template.evos.length && !allowedNFE[template.species]) continue;

		let tier = template.tier;
		let tier2 = template2.tier;
		switch (tier) {
		case 'Uber':
			// Ubers are limited to 2 but have a 20% chance of being added anyway.
			if (uberCount > 2 && this.random(5) >= 1) continue;
			break;
		case 'PU':
			// PUs are limited to 2 but have a 20% chance of being added anyway.
			if (puCount > 2 && this.random(5) >= 1) continue;
			break;
		}
		switch (tier2) {
		case 'Uber':
			// Ubers are limited to 2 but have a 20% chance of being added anyway.
			if (uberCount > 2 && this.random(5) >= 1) continue;
			break;
		case 'PU':
			// PUs are limited to 2 but have a 20% chance of being added anyway.
			if (puCount > 2 && this.random(5) >= 1) continue;
			break;
		}

		// Adjust rate for species with multiple formes
		switch (template.baseSpecies) {
		case 'Arceus': case 'Silvally':
			if (this.random(18) >= 1) continue;
			break;
		case 'Pikachu':
			if (this.random(7) >= 1) continue;
			continue;
		case 'Genesect':
			if (this.random(5) >= 1) continue;
			break;
		case 'Castform': case 'Gourgeist': case 'Oricorio':
			if (this.random(4) >= 1) continue;
			break;
		case 'Basculin': case 'Cherrim': case 'Greninja': case 'Hoopa': case 'Meloetta': case 'Meowstic':
			if (this.random(2) >= 1) continue;
			break;
		}
		switch (template2.baseSpecies) {
		case 'Arceus': case 'Silvally':
			if (this.random(18) >= 1) continue;
			break;
		case 'Pikachu':
			if (this.random(7) >= 1) continue;
			continue;
		case 'Genesect':
			if (this.random(5) >= 1) continue;
			break;
		case 'Castform': case 'Gourgeist': case 'Oricorio':
			if (this.random(4) >= 1) continue;
			break;
		case 'Basculin': case 'Cherrim': case 'Greninja': case 'Hoopa': case 'Meloetta': case 'Meowstic':
			if (this.random(2) >= 1) continue;
			break;
		}

		if (potd && potd.exists) {
			// The Pokemon of the Day belongs in slot 2
			if (team.length === 1) {
				template = potd;
				if (template.species === 'Magikarp') {
					template.randomBattleMoves = ['bounce', 'flail', 'splash', 'magikarpsrevenge'];
				} else if (template.species === 'Delibird') {
					template.randomBattleMoves = ['present', 'bestow'];
				}
			} else if (template.species === potd.species) {
				continue; // No thanks, I've already got one
			}
			}

			let set = this.randomSet(template, template2, i, teamDetails);


			let ability = set.ability;

			let item = '';
			item=set.item;
			// Make sure forme is legal
			if (template.battleOnly || template.requiredItems && !template.requiredItems.some(req => toId(req) === item)) {
				template = this.getTemplate(template.baseSpecies);
				species = template.name;
			}
			if(template2.battleOnly)
			{
			template2 = this.getTemplate(template2.baseSpecies);
			species2 = template2.name;
			}

			// Make sure that a base forme does not hold any forme-modifier items.
			let itemData = this.getItem(item);
			if (itemData.forcedForme && species === this.getTemplate(itemData.forcedForme).baseSpecies) {
				do {
					item = items[this.random(items.length)];
					itemData = this.getItem(item);
				} while (itemData.gen > this.gen || itemData.isNonstandard || itemData.forcedForme && species === this.getTemplate(itemData.forcedForme).baseSpecies);
			}



			// Four random unique moves from the movepool
			let incompatibleMoves = ['bellydrum', 'swordsdance', 'calmmind', 'nastyplot','dragondance','quiverdance','shiftgear','shellsmash','honeclaws','tailglow','workup','growth','sharpen','curse','coil','bulkup'];
			let moves=set.moves;
			let move;
			let moved;
			
			let intersectMoves = moves.filter(moved => incompatibleMoves.includes(moved));
			if (intersectMoves.length > 1) continue;

			let types = [template.types[0],template2.types[1]!=undefined?template2.types[1]:template2.types[0]] ;
				let skip = false;
				for (let t = 0; t < types.length; t++) 
				{
					if (typeCount[types[t]] > 1 && this.random(5) >= 1) 
					{
						skip = true;
						break;
					}
				}
			if (skip) continue;


			// Limit 1 of any type combination, 2 in monotype
			let typeCombo = types.slice().sort().join();
			if (set.ability === 'Drought' || set.ability === 'Drizzle' || set.ability === 'Sand Stream') {
				// Drought, Drizzle and Sand Stream don't count towards the type combo limit
				typeCombo = set.ability;
				if (typeCombo in typeComboCount) continue;
			} else {
				if (typeComboCount[typeCombo] >= 1) continue;
			}

			let nature = set.nature;

			// Level balance--calculate directly from stats rather than using some silly lookup table
			let mbstmin = 1307; // Sunkern has the lowest modified base stat total, and that total is 807
			let stats={};
			for(let statName in template.baseStats)
			{
			stats[statName] = (template.baseStats[statName]+template2.baseStats[statName])/2;
			}
			// If Wishiwashi, use the school-forme's much higher stats
			if (template.baseSpecies === 'Wishiwashi') stats = Dex.getTemplate('wishiwashischool').baseStats;

			// Modified base stat total assumes 31 IVs, 85 EVs in every stat
			let mbst = (stats["hp"] * 2 + 31 + 21 + 100) + 10;
			mbst += (stats["atk"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["def"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spa"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spd"] * 2 + 31 + 21 + 100) + 5;
			mbst += (stats["spe"] * 2 + 31 + 21 + 100) + 5;

			let level = Math.floor(100 * mbstmin / mbst); // Initial level guess will underestimate

			while (level < 100) {
				mbst = Math.floor((stats["hp"] * 2 + 31 + 21 + 100) * level / 100 + 10);
				mbst += Math.floor(((stats["atk"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100); // Since damage is roughly proportional to level
				mbst += Math.floor((stats["def"] * 2 + 31 + 21 + 100) * level / 100 + 5);
				mbst += Math.floor(((stats["spa"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
				mbst += Math.floor((stats["spd"] * 2 + 31 + 21 + 100) * level / 100 + 5);
				mbst += Math.floor((stats["spe"] * 2 + 31 + 21 + 100) * level / 100 + 5);

				if (mbst >= mbstmin) break;
				level++;
			}

			let evs=set.evs;
			let ivs=set.ivs;
			// Random gender--already handled by PS

			// PINGAS
			let happiness = 256;

			// Random shininess
			let shiny = !this.random(1024);

			//Counters
			if(this.getItem(item).megaStone)megaCount++;
			if(megaCount>1) {megaCount=1;continue;}
			if (item.megaStone) teamDetails['megaStone'] = 1;
			if (item.zMove) teamDetails['zMove'] = 1;
			if (ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (ability === 'Drizzle' || moves.includes('raindance')) teamDetails['rain'] = 1;
			if (ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (moves.includes('defog') || moves.includes('rapidspin')) teamDetails['hazardClear'] = 1;
			baseFormes[template.baseSpecies] = 1;
			baseFormes[template2.baseSpecies] = 1;

			// Increment type counters
			for (let t = 0; t < types.length; t++) {
				if (types[t] in typeCount) {
					typeCount[types[t]]++;
				} else {
					typeCount[types[t]] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Increment Uber/PU counters
			if (tier === 'Uber'|tier2 === 'Uber') {
				uberCount++;
			} else if (tier === 'PU'|tier2 === 'PU') {
				puCount++;
			}
			i++;

			team.push({
				name: '+'+template2.speciesid,
				species: template.species,
				item: item,
				ability: ability,
				moves: moves,
				evs: evs,
				ivs: ivs,
				nature: nature,
				level: level,
				happiness: happiness,
				shiny: shiny,
			});
		}

		return team;
	}
    randomSet(template, template2, slot, teamDetails)  {
		if (slot === undefined) slot = 1;
		let baseTemplate = (template = this.getTemplate(template));
		let species = template.species;

		if (!template.exists || (!template.randomBattleMoves && !template.learnset)) {
			// GET IT? UNOWN? BECAUSE WE CAN'T TELL WHAT THE POKEMON IS
			template = this.getTemplate('unown');

			let err = new Error('Template incompatible with random battles: ' + species);
			require('../crashlogger')(err, 'The randbat set generator');
		}
		let baseStatsFusion={};
		for(let bs in template.baseStats)
		{
			baseStatsFusion[bs]=(template.baseStats[bs]+template2.baseStats[bs])/2;
		}
		if (typeof teamDetails !== 'object') teamDetails = {megaStone: teamDetails};

		if (template.battleOnly) {
			// Only change the species. The template has custom moves, and may have different typing and requirements.
			species = template.baseSpecies;
		}
		let battleForme = this.checkBattleForme(template);
		if (battleForme && battleForme.randomBattleMoves && (battleForme.isMega ? !teamDetails.megaStone : this.random(2))) {
			template = this.getTemplate(template.otherFormes.length >= 2 ? template.otherFormes[this.random(template.otherFormes.length)] : template.otherFormes[0]);
		}

		let movePool1 = (template.randomBattleMoves ? template.randomBattleMoves.slice() : Object.keys(template.learnset));
		let movePool2 = (template2.randomBattleMoves ? template2.randomBattleMoves.slice() : Object.keys(template2.learnset));
		let movePool=movePool1.concat(movePool2);
		let moves = [];
		let ability = '';
		let ay;
		let abilitiesNonFiltered = Object.values((baseTemplate.isMega&baseTemplate.baseSpecies)?baseTemplate.baseSpecies.abilities:baseTemplate.abilities).concat(Object.values(template2.abilities));
		let abilities =abilitiesNonFiltered.filter(ay => (ay!='Moody'&ay!='Wonder Guard'));
		let item = '';
		let evs = {
			hp: 85,
			atk: 85,
			def: 85,
			spa: 85,
			spd: 85,
			spe: 85,
		};
		let ivs = {
			hp: 31,
			atk: 31,
			def: 31,
			spa: 31,
			spd: 31,
			spe: 31,
		};
		let hasType = {};
		hasType[template.types[0]] = true;
		if (template2.types[1]) {
			hasType[template2.types[1]] = true;
		}
		else 
		{
			hasType[template2.types[0]] = true;
		}
		let hasAbility = {};
		for(let a in abilities)
		{
			hasAbility[a] = true;
		}
		let availableHP = 0;
		for (let i = 0, len = movePool.length; i < len; i++) {
			if (movePool[i].substr(0, 11) === 'hiddenpower') availableHP++;
		}

		// These moves can be used even if we aren't setting up to use them:
		let SetupException = {
			closecombat:1, extremespeed:1, suckerpunch:1, superpower:1,
			dracometeor:1, leafstorm:1, overheat: 1, psychoboost: 1,dragonascent: 1, hammerarm: 1, hyperspacefury: 1
		};
		let counterAbilities = {
			'Adaptability':1, 'Contrary':1, 'Hustle':1, 'Iron Fist':1, 'Skill Link':1,
		};
		let ateAbilities = {
			'Aerilate':1, 'Pixilate':1, 'Refrigerate':1,'Galvanize':1
		};

		let hasMove, counter;

		do {
			// Keep track of all moves we have:
			hasMove = {};
			for (let k = 0; k < moves.length; k++) {
				if (moves[k].substr(0, 11) === 'hiddenpower') {
					hasMove['hiddenpower'] = true;
				} else {
					hasMove[moves[k]] = true;
				}
			}

			// Choose next 4 moves from learnset/viable moves and add them to moves list:
			while (moves.length < 4 && movePool.length) {
				let moveid = this.sampleNoReplace(movePool);
				if (moveid.substr(0, 11) === 'hiddenpower') {
					availableHP--;
					if (hasMove['hiddenpower']) continue;
					hasMove['hiddenpower'] = true;
				} else {
					hasMove[moveid] = true;
				}
				moves.push(moveid);
			}

			counter = this.queryMoves(moves, hasType, hasAbility, movePool);
		let moveList={};
		let heals=0;
			// Iterate through the moves again, this time to cull them:
			for (let k = 0; k < moves.length; k++) {
				let move = this.getMove(moves[k]);
				
				let moveid = move.id;
				let rejected = false;
				let isSetup = false;
				switch (moveid) {
				// Not very useful without their supporting moves
				case 'batonpass':
					if (!counter.setupType && !counter['speedsetup'] && !hasMove['substitute'] && !hasMove['wish'] && !hasAbility['Speed Boost']) rejected = true;
					break;
				case 'focuspunch':
					if (!hasMove['substitute'] || counter.damagingMoves.length < 2) rejected = true;
					break;
				case 'perishsong':
					if (!hasMove['protect']) rejected = true;
					break;
				case 'rest': {
					if (movePool.includes('sleeptalk')) rejected = true;
					break;
				}
				case 'sleeptalk':
					if (!hasMove['rest']) rejected = true;
					if (movePool.length > 1) {
						let rest = movePool.indexOf('rest');
						if (rest >= 0) this.fastPop(movePool, rest);
					}
					break;
				case 'storedpower':
					if (!counter.setupType && !hasMove['cosmicpower']) rejected = true;
					break;

				// Set up once and only if we have the moves for it
				case 'bellydrum': case 'bulkup': case 'coil': case 'curse': case 'dragondance': case 'honeclaws': case 'swordsdance':
					if (counter.setupType !== 'Physical' || counter['physicalsetup'] > 1) {
						if (!hasMove['growth'] || hasMove['sunnyday']) rejected = true;
					}
					if (counter.Physical + counter['physicalpool'] < 2 && !hasMove['batonpass'] && (!hasMove['rest'] || !hasMove['sleeptalk'])) rejected = true;
					isSetup = true;
					break;
				case 'calmmind': case 'geomancy': case 'nastyplot': case 'quiverdance': case 'tailglow':
					if (counter.setupType !== 'Special' || counter['specialsetup'] > 1) rejected = true;
					if (counter.Special + counter['specialpool'] < 2 && !hasMove['batonpass'] && (!hasMove['rest'] || !hasMove['sleeptalk'])) rejected = true;
					isSetup = true;
					break;
				case 'growth': case 'shellsmash': case 'workup':
					if (counter.setupType !== 'Mixed' || counter['mixedsetup'] > 1) rejected = true;
					if (counter.damagingMoves.length + counter['physicalpool'] + counter['specialpool'] < 2 && !hasMove['batonpass']) rejected = true;
					if (moveid === 'growth' && !hasMove['sunnyday']) rejected = true;
					isSetup = true;
					break;
				case 'agility': case 'autotomize': case 'rockpolish':
					if (counter.damagingMoves.length < 2 && !hasMove['batonpass']) rejected = true;
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					if (!counter.setupType) isSetup = true;
					break;
				case 'flamecharge':
					if (counter.damagingMoves.length < 3 && !counter.setupType && !hasMove['batonpass']) rejected = true;
					if (hasMove['dracometeor'] || hasMove['overheat']) rejected = true;
					break;
				case 'conversion':
					if (teamDetails.zMove || hasMove['triattack']) rejected = true;
					break;

				// Bad after setup
				case 'circlethrow': case 'dragontail':
					if (counter.setupType && ((!hasMove['rest'] && !hasMove['sleeptalk']) || hasMove['stormthrow'])) rejected = true;
					if (!!counter['speedsetup'] || hasMove['encore'] || hasMove['raindance'] || hasMove['roar'] || hasMove['whirlwind']) rejected = true;
					break;
				case 'defog':
					if (counter.setupType || hasMove['spikes'] || (hasMove['rest'] && hasMove['sleeptalk']) || teamDetails.hazardClear) rejected = true;
					break;
				case 'fakeout': case 'superfang':
					if (counter.setupType || hasMove['substitute'] || hasMove['switcheroo'] || hasMove['trick']) rejected = true;
					break;
				case 'foulplay':
					if (counter.setupType || !!counter['speedsetup'] || counter['Dark'] > 2 || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					if (counter.damagingMoves.length - 1 === counter['priority']) rejected = true;
					break;
				case 'haze': case 'spikes': case 'waterspout':
					if (counter.setupType || !!counter['speedsetup'] || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					break;
				case 'healbell':
					if (counter['speedsetup']) rejected = true;
					break;
				case 'healingwish': case 'memento':
					if (counter.setupType || !!counter['recovery'] || hasMove['substitute']) rejected = true;
					break;
				case 'nightshade': case 'seismictoss':
					if (counter.stab || counter.setupType || counter.damagingMoves.length > 2) rejected = true;
					break;
				case 'protect':
					if (counter.setupType && (hasAbility['Guts'] || hasAbility['Speed Boost']) && !hasMove['batonpass']) rejected = true;
					if ((hasMove['lightscreen'] && hasMove['reflect']) || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					break;
				case 'pursuit':
					if (counter.setupType || (hasMove['rest'] && hasMove['sleeptalk']) || (hasMove['knockoff'] && !hasType['Dark'])) rejected = true;
					break;
				case 'rapidspin':
					if (counter.setupType || teamDetails.hazardClear) rejected = true;
					break;
				case 'reversal':
					if (hasMove['substitute'] && teamDetails.zMove) rejected = true;
					break;
				case 'roar': case 'whirlwind':
					if (counter.setupType || hasMove['dragontail']) rejected = true;
					break;
				case 'stealthrock':
					if (counter.setupType || !!counter['speedsetup'] || hasMove['rest'] || teamDetails.stealthRock) rejected = true;
					break;
				case 'switcheroo': case 'trick':
					if (counter.Physical + counter.Special < 3 || counter.setupType) rejected = true;
					if (hasMove['acrobatics'] || hasMove['lightscreen'] || hasMove['reflect'] || hasMove['suckerpunch'] || hasMove['trickroom']) rejected = true;
					break;
				case 'toxicspikes':
					if (counter.setupType || teamDetails.toxicSpikes) rejected = true;
					break;
				case 'trickroom':
					if (counter.setupType || !!counter['speedsetup'] || counter.damagingMoves.length < 2) rejected = true;
					if (hasMove['lightscreen'] || hasMove['reflect']) rejected = true;
					break;
				case 'uturn':
					if (counter.setupType || !!counter['speedsetup'] || hasMove['batonpass']) rejected = true;
					if (hasType['Bug'] && counter.stab < 2 && counter.damagingMoves.length > 2 && !hasAbility['Adaptability'] && !hasMove['technoblast']) rejected = true;
					break;
				case 'voltswitch':
					if (counter.setupType || !!counter['speedsetup'] || hasMove['batonpass'] || hasMove['magnetrise'] || hasMove['uturn']) rejected = true;
					if (hasMove['nuzzle'] && hasMove['thunderbolt']) rejected = true;
					break;

				// Bit redundant to have both
				// Attacks:
				case 'bugbite': case 'bugbuzz': case 'signalbeam':
					if (hasMove['uturn'] && !counter.setupType) rejected = true;
					break;
				case 'lunge':
					if (hasMove['leechlife']) rejected = true;
					break;
				case 'darkpulse':
					if (hasMove['shadowball']) rejected = true;
					if ((hasMove['crunch'] || hasMove['hyperspacefury']) && counter.setupType !== 'Special') rejected = true;
					break;
				case 'suckerpunch':
					if (counter['Dark'] > 2 || (counter.setupType === 'Special' && hasType['Dark'] && counter.stab < 2)) rejected = true;
					if (counter['Dark'] > 1 && !hasType['Dark']) rejected = true;
					if (counter.damagingMoves.length < 2 || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'dragonclaw':
					if (hasMove['outrage'] || hasMove['dragontail']) rejected = true;
					break;
				case 'dracometeor':
					if (counter.setupType === 'Physical' && hasMove['outrage']) rejected = true;
					break;
				case 'dragonpulse': case 'spacialrend':
					if (hasMove['dracometeor'] || hasMove['outrage']) rejected = true;
					break;
				case 'outrage':
					if (hasMove['dracometeor'] && counter.damagingMoves.length < 3) rejected = true;
					break;
				case 'chargebeam':
					if (hasMove['thunderbolt'] && counter.Special < 3) rejected = true;
					break;
				case 'thunder':
					if (hasMove['thunderbolt'] && !hasMove['raindance']) rejected = true;
					break;
				case 'thunderbolt':
					if (hasMove['discharge'] || (hasMove['raindance'] && hasMove['thunder']) || (hasMove['voltswitch'] && hasMove['wildcharge'])) rejected = true;
					if (!counter.setupType && !counter['speedsetup'] && hasMove['voltswitch'] && template.types.length > 1 && !counter[template.types.find(type => type !== 'Electric')]) rejected = true;
					break;
				case 'dazzlinggleam':
					if (hasMove['playrough'] && counter.setupType !== 'Special') rejected = true;
					break;
				case 'drainingkiss':
					if (hasMove['dazzlinggleam'] || counter.setupType !== 'Special' && !hasAbility['triage']) rejected = true;
					break;
				case 'aurasphere': case 'focusblast':
					if ((hasMove['closecombat'] || hasMove['superpower']) && counter.setupType !== 'Special') rejected = true;
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'drainpunch':
					if (!hasMove['bulkup'] && (hasMove['closecombat'] || hasMove['highjumpkick'])) rejected = true;
					if (hasMove['focusblast'] || hasMove['superpower']) rejected = true;
					break;
				case 'closecombat': case 'highjumpkick':
					if ((hasMove['aurasphere'] || hasMove['focusblast'] || movePool.includes('aurasphere')) && counter.setupType === 'Special') rejected = true;
					if (hasMove['bulkup'] && hasMove['drainpunch']) rejected = true;
					break;
				case 'machpunch':
					if (hasType['Fighting'] && counter.stab < 2 && !hasAbility['Technician']) rejected = true;
					break;
				case 'stormthrow':
					if (hasMove['circlethrow'] && hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'superpower':
					if (counter['Fighting'] > 1 && counter.setupType) rejected = true;
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'vacuumwave':
					if ((hasMove['closecombat'] || hasMove['machpunch']) && counter.setupType !== 'Special') rejected = true;
					break;
				case 'blazekick':
					if (hasMove['flamethrower'] && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'fierydance': case 'firefang': case 'flamethrower':
					if ((hasMove['fireblast'] && counter.setupType !== 'Physical') || hasMove['overheat']) rejected = true;
					break;
				case 'fireblast':
					if (hasMove['lavaplume'] && !counter.setupType && !counter['speedsetup']) rejected = true;
					if (hasMove['flareblitz'] && counter.setupType !== 'Special') rejected = true;
					break;
				case 'firepunch': case 'sacredfire':
					if (hasMove['fireblast'] || hasMove['flareblitz']) rejected = true;
					break;
				case 'lavaplume':
					if (hasMove['fireblast'] && (counter.setupType || !!counter['speedsetup'])) rejected = true;
					break;
				case 'overheat':
					if (hasMove['lavaplume'] || counter.setupType === 'Special') rejected = true;
					break;
				case 'acrobatics':
					if (hasMove['hurricane'] && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'airslash': case 'oblivionwing':
					if (hasMove['acrobatics'] || hasMove['bravebird'] || hasMove['hurricane']) rejected = true;
					break;
				case 'fly':
					if (teamDetails.zMove || counter.setupType !== 'Physical') rejected = true;
					break;
				case 'hex':
					if (!hasMove['willowisp']) rejected = true;
					break;
				case 'shadowball':
					if (hasMove['hex'] && hasMove['willowisp']) rejected = true;
					break;
				case 'shadowclaw':
					if (hasMove['phantomforce'] || (hasMove['shadowball'] && counter.setupType !== 'Physical') || hasMove['shadowsneak']) rejected = true;
					break;
				case 'shadowsneak':
					if (hasType['Ghost'] && template.types.length > 1 && counter.stab < 2) rejected = true;
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'solarbeam':
					if ((!hasAbility['Drought'] && !hasMove['sunnyday']) || hasMove['gigadrain'] || hasMove['leafstorm']) rejected = true;
					break;
				case 'gigadrain':
					if (hasMove['petaldance'] || !counter.setupType && hasMove['leafstorm']) rejected = true;
					break;
				case 'leafblade': case 'seedbomb': case 'woodhammer':
					if (hasMove['gigadrain'] && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'leafstorm':
					if (counter['Grass'] > 1 && counter.setupType) rejected = true;
					break;
				case 'bonemerang': case 'precipiceblades':
					if (hasMove['earthquake']) rejected = true;
					break;
				case 'earthpower':
					if (hasMove['earthquake'] && counter.setupType !== 'Special') rejected = true;
					break;
				case 'icebeam':
					if (hasMove['blizzard'] || hasMove['freezedry']) rejected = true;
					break;
				case 'iceshard':
					if (hasMove['freezedry']) rejected = true;
					break;
				case 'bodyslam':
					if (hasMove['glare'] || hasMove['headbutt']) rejected = true;
					break;
				case 'endeavor':
					if (slot > 0) rejected = true;
					break;
				case 'explosion':
					if (counter.setupType || (hasAbility['Refrigerate'] && hasMove['freezedry']) || hasMove['wish']) rejected = true;
					break;
				case 'extremespeed':
					if (counter.setupType !== 'Physical' && hasMove['vacuumwave']) rejected = true;
					break;
				case 'facade':
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'hiddenpower':
					if (hasMove['rest'] || !counter.stab && counter.damagingMoves.length < 2) rejected = true;
					break;
				case 'hypervoice':
					if (hasMove['naturepower'] || hasMove['return']) rejected = true;
					if (hasAbility['Liquid Voice'] && hasMove['scald']) rejected = true;
					break;
				case 'judgment':
					if (counter.setupType !== 'Special' && counter.stab > 1) rejected = true;
					break;
				case 'quickattack':
					if (hasType['Normal'] && counter['Normal'] > 1 && template.types.length > 1 && counter.stab < 2) rejected = true;
					break;
				case 'return': case 'rockclimb':
					if (hasMove['bodyslam'] || hasMove['doubleedge']) rejected = true;
					break;
				case 'weatherball':
					if (!hasMove['raindance'] && !hasMove['sunnyday']) rejected = true;
					break;
				case 'acidspray':
					if (hasMove['sludgebomb'] || counter.Special < 2) rejected = true;
					break;
				case 'poisonjab':
					if (hasMove['gunkshot']) rejected = true;
					break;
				case 'sludgewave':
					if (hasMove['poisonjab']) rejected = true;
					break;
				case 'psychic':
					if (hasMove['psyshock'] || hasMove['storedpower']) rejected = true;
					break;
				case 'psychocut': case 'zenheadbutt':
					if ((hasMove['psychic'] || hasMove['psyshock']) && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'psyshock':
					if (movePool.length > 1) {
						let psychic = movePool.indexOf('psychic');
						if (psychic >= 0) this.fastPop(movePool, psychic);
					}
					break;
				case 'headsmash':
					if (hasMove['stoneedge']) rejected = true;
					break;
				case 'rockblast': case 'rockslide':
					if (hasMove['headsmash'] || hasMove['stoneedge']) rejected = true;
					break;
				case 'bulletpunch':
					if (hasType['Steel'] && counter.stab < 2 && !hasAbility['Adaptability'] && !hasAbility['Technician']) rejected = true;
					break;
				case 'flashcannon':
					if (hasMove['ironhead']) rejected = true;
					break;
				case 'hydropump':
					if (hasMove['razorshell'] || hasMove['scald'] || hasMove['waterfall'] || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					break;
				case 'originpulse': case 'surf':
					if (hasMove['hydropump'] || hasMove['scald']) rejected = true;
					break;
				case 'scald':
					if (hasMove['liquidation'] || hasMove['waterfall'] || hasMove['waterpulse']) rejected = true;
					break;

				// Status:
				case 'raindance':
					if (counter.Physical + counter.Special < 2 || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					if (!hasType['Water'] && !hasMove['thunder']) rejected = true;
					break;
				case 'sunnyday':
					if (counter.Physical + counter.Special < 2 || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					if (!hasAbility['Chlorophyll'] && !hasAbility['Flower Gift'] && !hasMove['solarbeam']) rejected = true;
					if (rejected && movePool.length > 1) {
						let solarbeam = movePool.indexOf('solarbeam');
						if (solarbeam >= 0) this.fastPop(movePool, solarbeam);
						if (movePool.length > 1) {
							let weatherball = movePool.indexOf('weatherball');
							if (weatherball >= 0) this.fastPop(movePool, weatherball);
						}
					}
					break;
				case 'stunspore': case 'thunderwave':
					if (counter.setupType || !!counter['speedsetup'] || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					if (hasMove['discharge'] || hasMove['gyroball'] || hasMove['spore'] || hasMove['toxic'] || hasMove['trickroom'] || hasMove['yawn']) rejected = true;
					break;
				case 'toxic':
					if (counter.setupType || hasMove['flamecharge'] || (hasMove['rest'] && hasMove['sleeptalk'])) rejected = true;
					if (hasMove['hypnosis'] || hasMove['sleeppowder'] || hasMove['willowisp'] || hasMove['yawn']) rejected = true;
					break;
				case 'willowisp':
					if (hasMove['scald']) rejected = true;
					break;
				case 'moonlight': case 'painsplit': case 'recover': case 'roost': case 'softboiled': case 'synthesis':
					if (hasMove['leechseed'] || hasMove['rest'] || hasMove['wish']) rejected = true;
					break;
				case 'safeguard':
					if (hasMove['destinybond']) rejected = true;
					break;
				case 'substitute':
					if (hasMove['dracometeor'] || (hasMove['leafstorm'] && !hasAbility['Contrary']) || hasMove['pursuit'] || hasMove['rest'] || hasMove['taunt'] || hasMove['uturn'] || hasMove['voltswitch']) rejected = true;
					break;
				}

				// Increased/decreased priority moves are unneeded with moves that boost only speed
				if (move.priority !== 0 && (!!counter['speedsetup'] || hasMove['copycat'])) {
					rejected = true;
				}

				// Certain Pokemon should always have a recovery move
				if (!counter.recovery && baseStatsFusion.hp >= 165 && movePool.includes('wish')) {
					if (move.category === 'Status' || !hasType[move.type] && !move.damage) rejected = true;
				}
				if (template.nfe && !isSetup && !counter.recovery && !!counter['Status'] && (movePool.includes('recover') || movePool.includes('roost'))) {
					if (move.category === 'Status' || !hasType[move.type]) rejected = true;
				}

				// This move doesn't satisfy our setup requirements:
				if ((move.category === 'Physical' && counter.setupType === 'Special') || (move.category === 'Special' && counter.setupType === 'Physical')) {
					// Reject STABs last in case the setup type changes later on
					if (!SetupException[moveid] && (!hasType[move.type] || counter.stab > 1 || counter[move.category] < 2)) rejected = true;
				}
				if (counter.setupType && !isSetup && counter.setupType !== 'Mixed' && move.category !== counter.setupType && counter[counter.setupType] < 2 && !hasMove['batonpass'] && moveid !== 'rest' && moveid !== 'sleeptalk') {
					// Mono-attacking with setup and RestTalk is allowed
					// Reject Status moves only if there is nothing else to reject
					if (move.category !== 'Status' || counter[counter.setupType] + counter.Status > 3 && counter['physicalsetup'] + counter['specialsetup'] < 2) rejected = true;
				}
				if (counter.setupType === 'Special' && moveid === 'hiddenpower' && template.types.length > 1 && counter['Special'] <= 2 && !hasType[move.type] && !counter['Physical'] && counter['specialpool']) {
					// Hidden Power isn't good enough
					rejected = true;
				}

				// Pokemon should have moves that benefit their Ability/Type/Weather, as well as moves required by its forme
				if ((hasType['Bug'] && !hasMove['batonpass'] && (movePool.includes('megahorn') || movePool.includes('pinmissile') || (hasType['Flying'] && !hasMove['hurricane'] && movePool.includes('bugbuzz')))) ||
					(hasType['Dark'] && hasMove['suckerpunch'] && counter.stab < template.types.length) ||
					(hasType['Dragon'] && !counter['Dragon'] && !hasAbility['Aerilate'] && !hasAbility['Pixilate'] && !hasMove['rest'] && !hasMove['sleeptalk']) ||
					(hasType['Electric'] && !counter['Electric']) ||
					(hasType['Fighting'] && !counter['Fighting'] && (counter.setupType || !counter['Status'])) ||
					(hasType['Fire'] && !counter['Fire']) ||
					(hasType['Ground'] && !counter['Ground'] && (counter.setupType || counter['speedsetup'] || hasMove['raindance'] || !counter['Status'])) ||
					(hasType['Ice'] && !counter['Ice'] && !hasAbility['Refrigerate']) ||
					(hasType['Psychic'] && !!counter['Psychic'] && !hasType['Flying'] && !hasAbility['Pixilate'] && template.types.length > 1 && counter.stab < 2) ||
					(hasType['Water'] && !counter['Water'] && (!hasType['Ice'] || !counter['Ice']) && !hasAbility['Protean']) ||
					((hasAbility['Adaptability'] && !counter.setupType && template.types.length > 1 && (!counter[template.types[0]] || !counter[template.types[1]])) ||
					((hasAbility['Aerilate'] || hasAbility['Pixilate'] || hasAbility['Refrigerate']) && !counter['Normal']) ||
					(hasAbility['Contrary'] && !counter['contrary'] && template.species !== 'Shuckle') ||
					(hasAbility['Dark Aura'] && !counter['Dark']) ||
					(hasAbility['Electric Surge'] && !counter['Electric']) ||
					(hasAbility['Gale Wings'] && !counter['Flying']) ||
					(hasAbility['Grassy Surge'] && !counter['Grass']) ||
					(hasAbility['Guts'] && hasType['Normal'] && movePool.includes('facade')) ||
					(hasAbility['Psychic Surge'] && !counter['Psychic']) ||
					(hasAbility['Slow Start'] && movePool.includes('substitute')) ||
					(hasAbility['Stance Change'] && !counter.setupType && movePool.includes('kingsshield')) ||
					(hasAbility['Water Bubble'] && !counter['Water']) ||
					(counter['defensesetup'] && !counter.recovery && !hasMove['rest']) ||
					(movePool.includes('technoblast') || template.requiredMove && movePool.includes(toId(template.requiredMove)))) &&
					(counter['physicalsetup'] + counter['specialsetup'] < 2 && (!counter.setupType || counter.setupType === 'Mixed' || (move.category !== counter.setupType && move.category !== 'Status') || counter[counter.setupType] + counter.Status > 3))) {
					// Reject Status or non-STAB
					if (!isSetup && !move.weather && moveid !== 'judgment' && moveid !== 'rest' && moveid !== 'sleeptalk') {
						if (move.category === 'Status' || !hasType[move.type] || (move.basePower && move.basePower < 40 && !move.multihit)) rejected = true;
					}
				}

				// Sleep Talk shouldn't be selected without Rest
				if (moveid === 'rest' && rejected) {
					let sleeptalk = movePool.indexOf('sleeptalk');
					if (sleeptalk >= 0) {
						if (movePool.length < 2) {
							rejected = false;
						} else {
							this.fastPop(movePool, sleeptalk);
						}
					}
				}
				
				if(move.flags['heal']==1&&move.basePower==0)
				{
					heals++;
				}
				if(heals>1) {heals--;rejected = true;} 
				if(!moveList[moveid])moveList[moveid]=1;
				else rejected=true;
				
				// Remove rejected moves from the move list
				if (rejected && (movePool.length - availableHP || availableHP && (moveid === 'hiddenpower' || !hasMove['hiddenpower']))) {
					moves.splice(k, 1);
					break;
				}
				
			}
			if (moves.length === 4 && !counter.stab && !hasMove['metalburst'] && (counter['physicalpool'] || counter['specialpool'])) {
				// Move post-processing:
				if (counter.damagingMoves.length === 0) {
					// A set shouldn't have no attacking moves
					moves.splice(this.random(moves.length), 1);
				} else if (counter.damagingMoves.length === 1) {
					// In most cases, a set shouldn't have no STAB
					let damagingid = counter.damagingMoves[0].id;
					if (movePool.length - availableHP || availableHP && (damagingid === 'hiddenpower' || !hasMove['hiddenpower'])) {
						let replace = false;
						if (!counter.damagingMoves[0].damage && template.species !== 'Porygon2') {
							let damagingType = counter.damagingMoves[0].type;
							if (damagingType === 'Fairy') {
								// Mono-Fairy is acceptable for Psychic types
								if (counter.setupType !== 'Special' || template.types.length > 1 || !hasType['Psychic']) replace = true;
							} else {
								replace = true;
							}
						}
						if (replace) moves.splice(counter.damagingMoveIndex[damagingid], 1);
					}
				} else if (!counter.damagingMoves[0].damage && !counter.damagingMoves[1].damage && template.species !== 'Porygon2') {
					// If you have three or more attacks, and none of them are STAB, reject one of them at random.
					let rejectableMoves = [];
					let baseDiff = movePool.length - availableHP;
					for (let l = 0; l < counter.damagingMoves.length; l++) {
						if (counter.damagingMoves[l].id === 'technoblast') continue;
						if (baseDiff || availableHP && (!hasMove['hiddenpower'] || counter.damagingMoves[l].id === 'hiddenpower')) {
							rejectableMoves.push(counter.damagingMoveIndex[counter.damagingMoves[l].id]);
						}
					}
					if (rejectableMoves.length) {
						moves.splice(rejectableMoves[this.random(rejectableMoves.length)], 1);
					}
				}
			}
		} while (moves.length < 4 && movePool.length);

		// Moveset modifications
		if (hasMove['autotomize'] && hasMove['heavyslam']) {
			moves[moves.indexOf('autotomize')] = 'rockpolish';
		}
		if (moves[0] === 'conversion') {
			moves[0] = moves[3];
			moves[3] = 'conversion';
		}

		abilities.sort((a, b) => this.getAbility(b).rating - this.getAbility(a).rating);
		ability = this.getAbility(abilities[0]).name;
		let integ=1;
		if (abilities[1]) {
			for(let ab=0;ab<abilities.length-1;ab++)
			{
				if(abilities[ab+1]&& abilities[ab+1].rating === this.getAbility(ability).rating) {
					integ=ab+1;
					if (this.random(2)) {ability = abilities[ab+1].name;integ=ab;}
				}	
			}

			let rejectAbility = false;
			if (ability in counterAbilities) {
				// Adaptability, Contrary, Hustle, Iron Fist, Skill Link
				rejectAbility = !counter[toId(ability)];
			} else if (ability in ateAbilities) {
				rejectAbility = !counter['Normal'];
			} else if (ability === 'Blaze') {
				rejectAbility = !counter['Fire'];
			} else if (ability === 'Chlorophyll') {
				rejectAbility = !hasMove['sunnyday'];
			} else if (ability === 'Compound Eyes' || ability === 'No Guard') {
				rejectAbility = !counter['inaccurate'];
			} else if (ability === 'Defiant' || ability === 'Moxie') {
				rejectAbility = !counter['Physical'] && !hasMove['batonpass'];
			} else if (ability === 'Moody') {
				rejectAbility = true;
			} else if (ability === 'Gluttony') {
				rejectAbility = !hasMove['bellydrum'];
			} else if (ability === 'Lightning Rod') {
				rejectAbility = template.types.includes('Ground');
			} else if (ability === 'Limber') {
				rejectAbility = template.types.includes('Electric');
			} else if (ability === 'Liquid Voice') {
				rejectAbility = !hasMove['hypervoice'];
			} else if (ability === 'Overgrow') {
				rejectAbility = !counter['Grass'];
			} else if (ability === 'Poison Heal') {
				rejectAbility = abilities.includes('Technician') && !!counter['technician'];
			} else if (ability === 'Prankster') {
				rejectAbility = !counter['Status'];
			} else if (ability === 'Quick Feet') {
				rejectAbility = hasMove['bellydrum'];
			} else if (ability === 'Reckless' || ability === 'Rock Head') {
				rejectAbility = !counter['recoil'];
			} else if (ability === 'Sand Veil') {
				rejectAbility = !teamDetails['sand'];
			} else if (ability === 'Serene Grace') {
				rejectAbility = counter['serenegrace']===0;
			} else if (ability === 'Sheer Force') {
				rejectAbility = !counter['sheerforce'] || (abilities.includes('Iron Fist') && counter['sheerforce'] < 2 && counter['ironfist'] > counter['sheerforce']);
			} else if (ability === 'Simple') {
				rejectAbility = !counter.setupType && !hasMove['cosmicpower'] && !hasMove['flamecharge'];
			} else if (ability === 'Snow Cloak') {
				rejectAbility = !teamDetails['hail'];
			} else if (ability === 'Solar Power') {
				rejectAbility = !counter['Special'] || template.isMega;
			} else if (ability === 'Strong Jaw') {
				rejectAbility = !counter['bite'];
			} else if (ability === 'Sturdy') {
				rejectAbility = !!counter['recoil'] && !counter['recovery'];
			} else if (ability === 'Swift Swim') {
				rejectAbility = !hasMove['raindance'] && !teamDetails['rain'];
			} else if (ability === 'Swarm') {
				rejectAbility = !counter['Bug'];
			} else if (ability === 'Synchronize') {
				rejectAbility = counter.Status < 2;
			} else if (ability === 'Technician') {
				rejectAbility = !counter['technician'] || (abilities.includes('Skill Link') && counter['skilllink'] >= counter['technician']);
			} else if (ability === 'Tinted Lens') {
				rejectAbility = counter['damage'] >= counter.damagingMoves.length;
			} else if (ability === 'Torrent') {
				rejectAbility = !counter['Water'];
			} else if (ability === 'Triage') {
				rejectAbility = !counter['recovery'] && !counter['drain'];
			} else if (ability === 'Unburden') {
				rejectAbility = !counter.setupType && !hasMove['acrobatics'];
			} else if (ability === 'Wonder Guard') {
				rejectAbility = true;
			} else if (ability === 'Moody') {
				rejectAbility = true;
			} else if (ability === 'Multitype') {
				rejectAbility = template.species!='Arceus';
			} else if (ability === 'RKS System') {
				rejectAbility = template.species!='Silvally';
			} else if (ability === 'Stance Change') {
			  rejectAbility = template.species!='Aegislash';
			} else if (ability === 'Disguise') {
			  rejectAbility = template.species!='Mimikyu';
			} else if (ability === 'Shields Down') {
			  rejectAbility = template.species!='Minior';
			} else if (ability === 'Forecast') {
			  rejectAbility = template.species!='Castform';
			} else if (ability === 'Contrary') {
			 rejectAbility = !moves.includes('shellsmash')?counter['physicalsetup']|counter['mixedsetupsetup']|counter['specialsetup']|counter['speedsetup']|counter['defensesetup']:false;
			} else if (ability === 'Battle Bond') {
			  rejectAbility = template.species!='Greninja';
			} else if (ability === 'Flower Gift') {
			  rejectAbility = template.species!='Cherrim';
			} 
			if (rejectAbility) {
				if((abilities[integ].rating>=1)&(abilities[integ].name!='Wonder Guard'&abilities[integ].name!='Moody')&abilities[integ])
				{
					ability=abilities[integ].name;
				}
			}
			if (abilities.includes('Chlorophyll') && ability !== 'Solar Power' && hasMove['sunnyday']) {
				ability = 'Chlorophyll';
			}
			if (abilities.includes('Guts') && ability !== 'Quick Feet' && (hasMove['facade'] || hasMove['protect'] || (hasMove['rest'] && hasMove['sleeptalk']))) {
				ability = 'Guts';
			}
			if (abilities.includes('Liquid Voice') && hasMove['hypervoice']) {
				ability = 'Liquid Voice';
			}
			if (abilities.includes('Marvel Scale') && hasMove['rest'] && hasMove['sleeptalk']) {
				ability = 'Marvel Scale';
			}
			if (abilities.includes('Prankster') && counter.Status > 1) {
				ability = 'Prankster';
			}
			if (abilities.includes('Swift Swim') && hasMove['raindance']) {
				ability = 'Swift Swim';
			}
			if (abilities.includes('Triage') && (counter['drain']>0|counter['heal']>0)) {
				ability = 'Triage';
			}
			if (abilities.includes('Unburden') && hasMove['acrobatics']) {
				ability = 'Unburden';
			}
			if (abilities.includes('Water Bubble') && counter['Water']) {
				ability = 'Water Bubble';
			}
		}

		if (hasMove['rockclimb'] && ability !== 'Sheer Force') {
			moves[moves.indexOf('rockclimb')] = 'doubleedge';
		}
		if (hasMove['thunderpunch'] && ability === 'Galvanize') {
			moves[moves.indexOf('thunderpunch')] = 'return';
		}
		if (hasMove['wildcharge'] && ability === 'Galvanize'&!hasMove['return']) {
			moves[moves.indexOf('wildcharge')] = 'return';
		}

		item = 'Leftovers';
		if (template.requiredItems) {
			if (template.baseSpecies === 'Arceus' && hasMove['judgment']) {
				// Judgment doesn't change type with Z-Crystals
				item = template.requiredItems[0];
			} else {
				item = template.requiredItems[this.random(template.requiredItems.length)];
			}
		} else if (hasMove['magikarpsrevenge']) {
			// PoTD Magikarp
			item = 'Choice Band';
		} else if (template.species === 'Rotom-Fan') {
			// This is just to amuse Zarel
			item = 'Air Balloon';

		// First, the extra high-priority items
		} else if (template.species === 'Clamperl' && !hasMove['shellsmash']) {
			item = 'Deep Sea Tooth';
		} else if ((template.species === 'Cubone' || template.baseSpecies === 'Marowak' )&& counter['Physical']>0) {
			item = 'Thick Club';
		} else if (ability === 'Cheeck Pouch') {
			item = 'Sitrus Berry';
		} else if (baseStatsFusion.hp+baseStatsFusion.def+baseStatsFusion.spd<=90) {
			item = (slot === 0 && hasMove['stealthrock']) ? 'Focus Sash' : 'Life Orb';
		} else if (template.species === 'Farfetch\'d') {
			item = 'Stick';
		} else if (template.baseSpecies === 'Pikachu') {
			item = 'Light Ball';
		}  else if (ability==='Super Luck' && counter['damage'] >= 2) {
			item = 'Scope Lens';
		} else if (moves.includes('counter')&moves.includes('mirrorcoat')) {
			item = hasMove['destinybond'] ? 'Custap Berry' : ['Leftovers', 'Sitrus Berry'][this.random(2)];
		} else if (template.species === 'Raichu-Alola' && hasMove['thunderbolt'] && !teamDetails.zMove && this.random(4) < 1) {
			item = 'Aloraichium Z';
		} else if (ability === 'Imposter'&baseStatsFusion.hp<100) {
			item = 'Choice Scarf';
		} else if (ability === 'Klutz' && hasMove['switcheroo']) {
			// To perma-taunt a Pokemon by giving it Assault Vest
			item = 'Assault Vest';
		} else if (hasMove['conversion']) {
			item = 'Normalium Z';
		} else if (!teamDetails.zMove && (hasMove['fly'] || hasMove['bounce'] && counter.setupType)) {
			item = 'Flyinium Z';
		} else if (hasMove['geomancy']) {
			item = 'Power Herb';
		} else if (hasMove['switcheroo'] || hasMove['trick']) {
			let randomNum = this.random(3);
			if (counter.Physical >= 3 && (baseStatsFusion.spe < 60 || baseStatsFusion.spe > 108 || randomNum)) {
				item = 'Choice Band';
			} else if (counter.Special >= 3 && (baseStatsFusion.spe < 60 || baseStatsFusion.spe > 108 || randomNum)) {
				item = 'Choice Specs';
			} else if (ability!='Speed Boost'){
				item = 'Choice Scarf';
			}
		} else if (template.evos.length) {
			item = (ability === 'Technician' && counter.Physical >= 4) ? 'Choice Band' : 'Eviolite';
		} else if (hasMove['bellydrum']) {
			if (ability === 'Gluttony') {
				item = ['Aguav', 'Figy', 'Iapapa', 'Mago', 'Wiki'][this.random(5)] + ' Berry';
			} else if (baseStatsFusion.spe <= 50 && !teamDetails.zMove && this.random(2)) {
				item = 'Normalium Z';
			} else {
				item = 'Sitrus Berry';
			}
		} else if (hasMove['shellsmash']) {
			item = (ability === 'Solid Rock' && counter['priority']) ? 'Weakness Policy' : 'White Herb';
		} else if (ability === 'Harvest') {
			item = hasMove['rest'] ? 'Lum Berry' : 'Sitrus Berry';
		} else if (ability === 'Magic Guard' || ability === 'Sheer Force') {
			item = hasMove['psychoshift'] ? 'Flame Orb' : 'Life Orb';
		} else if (ability === 'Poison Heal' || ability === 'Toxic Boost') {
			item = 'Toxic Orb';
		} else if (hasMove['rest'] && !hasMove['sleeptalk'] && ability !== 'Natural Cure' && ability !== 'Shed Skin') {
			item = (hasMove['raindance'] && ability === 'Hydration') ? 'Damp Rock' : 'Chesto Berry';
		} else if (hasMove['raindance']) {
			item = (ability === 'Swift Swim' && counter.Status < 2) ? 'Life Orb' : 'Damp Rock';
		} else if (hasMove['sunnyday']) {
			item = (ability === 'Chlorophyll' && counter.Status < 2) ? 'Life Orb' : 'Heat Rock';
		} else if ((hasMove['lightscreen'] && hasMove['reflect']) || hasMove['auroraveil']) {
			item = 'Light Clay';
		} else if ((ability === 'Guts' || hasMove['facade']) && !hasMove['sleeptalk']) {
			item = (hasType['Fire'] || ability === 'Quick Feet') ? 'Toxic Orb' : 'Flame Orb';
		} else if (ability === 'Unburden') {
			if (hasMove['fakeout']) {
				item = 'Normal Gem';
			} else {
				item = 'Sitrus Berry';
			}
		} else if (hasMove['acrobatics']) {
			item = '';

		// Medium priority
		} else if (((ability === 'Speed Boost' && !hasMove['substitute']) || (ability === 'Stance Change')) && counter.Physical + counter.Special > 2) {
			item = 'Life Orb';
		} else if (baseStatsFusion.spe <= 50 && hasMove['sleeppowder'] && counter.setupType && !teamDetails.zMove) {
			item = 'Grassium Z';
		} else if (counter.Physical >= 4 && !hasMove['bodyslam'] && !hasMove['dragontail'] && !hasMove['fakeout'] && !hasMove['flamecharge'] && !hasMove['rapidspin'] && !hasMove['suckerpunch']) {
			item = baseStatsFusion.atk >= 100 && baseStatsFusion.spe >= 60 && baseStatsFusion.spe <= 108 && !counter['priority'] && this.random(3) ? 'Choice Scarf' : 'Choice Band';
		} else if (counter.Special >= 4 && !hasMove['acidspray'] && !hasMove['chargebeam'] && !hasMove['clearsmog'] && !hasMove['fierydance']) {
			item = baseStatsFusion.spa >= 100 && baseStatsFusion.spe >= 60 && baseStatsFusion.spe <= 108 && !counter['priority'] && this.random(3) ? 'Choice Scarf' : 'Choice Specs';
		} else if (counter.Special >= 3 && hasMove['uturn'] && baseStatsFusion.spe >= 60 && baseStatsFusion.spe <= 108 && !counter['priority'] && this.random(3)) {
			item = 'Choice Scarf';
		} else if (ability === 'Defeatist' || hasMove['eruption'] || hasMove['waterspout']) {
			item = counter.Status <= 1 ? 'Expert Belt' : 'Leftovers';
		} else if (hasMove['reversal'] && hasMove['substitute'] && !teamDetails.zMove) {
			item = 'Fightinium Z';
		} else if ((hasMove['endeavor'] || hasMove['flail'] || hasMove['reversal']) && ability !== 'Sturdy') {
			item = 'Focus Sash';
		} else if (this.getEffectiveness('Ground', template) >= 2 && ability !== 'Levitate' && !hasMove['magnetrise']) {
			item = 'Air Balloon';
		} else if (hasMove['outrage'] && (counter.setupType || ability === 'Multiscale')) {
			item = 'Lum Berry';
		} else if (ability === 'Slow Start' || hasMove['clearsmog'] || hasMove['curse'] || hasMove['detect'] || hasMove['protect'] || hasMove['sleeptalk']) {
			item = 'Leftovers';
		} else if (hasMove['substitute']) {
			item = !counter['drain'] || counter.damagingMoves.length < 2 ? 'Leftovers' : 'Life Orb';
		} else if (hasMove['lightscreen'] || hasMove['reflect']) {
			item = 'Light Clay';
		} else if (ability === 'Iron Barbs' || ability === 'Rough Skin') {
			item = 'Rocky Helmet';
		} else if (counter.Physical + counter.Special >= 4 && baseStatsFusion.spd >= 65 && (baseStatsFusion.def + baseStatsFusion.spd >= 190 || hasMove['rapidspin'])) {
			item = 'Assault Vest';
		} else if (counter.damagingMoves.length >= 4) {
			item = (!!counter['Normal'] || (hasMove['suckerpunch'] && !hasType['Dark'])) ? 'Life Orb' : 'Expert Belt';
		} else if (counter.damagingMoves.length >= 3 && !!counter['speedsetup'] && baseStatsFusion.hp + baseStatsFusion.def + baseStatsFusion.spd >= 300) {
			item = 'Weakness Policy';
		} else if (counter.damagingMoves.length >= 3 && ability !== 'Sturdy' && !hasMove['clearsmog'] && !hasMove['dragontail'] && !hasMove['foulplay'] && !hasMove['superfang']) {
			item = (baseStatsFusion.hp + baseStatsFusion.def + baseStatsFusion.spd < 285 || !!counter['speedsetup'] || hasMove['trickroom']) ? 'Life Orb' : 'Leftovers';
		} else if (template.species === 'Palkia' && (hasMove['dracometeor'] || hasMove['spacialrend']) && hasMove['hydropump']) {
			item = 'Lustrous Orb';
		} else if (slot === 0 && ability !== 'Regenerator' && ability !== 'Sturdy' && !counter['recoil'] && !counter['recovery'] && baseStatsFusion.hp + baseStatsFusion.def + baseStatsFusion.spd < 285) {
			item = 'Focus Sash';

		// This is the "REALLY can't think of a good item" cutoff
		} else if (ability === 'Super Luck') {
			item = 'Scope Lens';
		} else if (ability === 'Sturdy' && hasMove['explosion'] && !counter['speedsetup']) {
			item = 'Custap Berry';
		} else if (hasType['Poison']) {
			item = 'Black Sludge';
		} else if (ability === 'Gale Wings' && hasMove['bravebird']) {
			item = !teamDetails.zMove ? 'Flyinium Z' : 'Sharp Beak';
		} else if (this.getEffectiveness('Rock', template) >= 1 || hasMove['dragontail']) {
			item = 'Leftovers';
		} else if (this.getImmunity('Ground', template) && this.getEffectiveness('Ground', template) >= 1 && ability !== 'Levitate' && ability !== 'Solid Rock' && !hasMove['magnetrise'] && !hasMove['sleeptalk']) {
			item = 'Air Balloon';
		} else if (counter.Status <= 1 && ability !== 'Sturdy' && !hasMove['rapidspin']) {
			item = 'Life Orb';
		} else {
			item = 'Leftovers';
		}

		// For Trick / Switcheroo
		if (item === 'Leftovers' && hasType['Poison']) {
			item = 'Black Sludge';
		}

		let levelScale = {
			LC: 87,
			'LC Uber': 86,
			NFE: 84,
			PU: 83,
			BL4: 82,
			NU: 81,
			BL3: 80,
			RU: 79,
			BL2: 78,
			UU: 77,
			BL: 76,
			OU: 75,
			Uber: 73,
			AG: 71,
		};
		let customScale = {
			// Banned Abilities
			Gothitelle: 77, Politoed: 79, Wobbuffet: 77,

			// Holistic judgement
			Unown: 100,
		};
		let tier = template.tier;
		if (tier.includes('Unreleased') && baseTemplate.tier === 'Uber') {
			tier = 'Uber';
		}
		if (tier.charAt(0) === '(') {
			tier = tier.slice(1, -1);
		}
		let level = levelScale[tier] || 75;
		if (customScale[template.name]) level = customScale[template.name];

		// Custom level based on moveset
		if (ability === 'Power Construct') level = 73;
		if (hasMove['batonpass'] && counter.setupType && level > 77) level = 77;
		// if (template.name === 'Slurpuff' && !counter.setupType) level = 81;
		// if (template.name === 'Xerneas' && hasMove['geomancy']) level = 71;

		// Prepare optimal HP
		let hp = Math.floor(Math.floor(2 * baseStatsFusion.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
		if (hasMove['substitute'] && (item === 'Sitrus Berry' || (ability === 'Power Construct' && item !== 'Leftovers'))) {
			// Two Substitutes should activate Sitrus Berry or Power Construct
			while (hp % 4 > 0) {
				evs.hp -= 4;
				hp = Math.floor(Math.floor(2 * baseStatsFusion.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
			}
		} else if (hasMove['bellydrum'] && (item === 'Sitrus Berry' || ability === 'Gluttony')) {
			// Belly Drum should activate Sitrus Berry
			if (hp % 2 > 0) evs.hp -= 4;
		} else if (hasMove['substitute'] && hasMove['reversal']) {
			// Reversal users should be able to use four Substitutes
			if (hp % 4 === 0) evs.hp -= 4;
		} else {
			// Maximize number of Stealth Rock switch-ins
			let srWeakness = this.getEffectiveness('Rock', template);
			if (srWeakness > 0 && hp % (4 / srWeakness) === 0) evs.hp -= 4;
		}

		// Minimize confusion damage
		if (!counter['Physical'] && !hasMove['copycat'] && !hasMove['transform']) {
			evs.atk = 0;
			ivs.atk = 0;
		}

		if (hasMove['gyroball'] || hasMove['trickroom']) {
			evs.spe = 0;
			ivs.spe = 0;
		}

		return {
			name: template.baseSpecies,
			species: species,
			moves: moves,
			ability: ability,
			evs: evs,
			ivs: ivs,
			item: item,
			level: level,
			shiny: !this.random(1024),
		};
	}
    queryMoves(moves, hasType, hasAbility, movePool) {
		// This is primarily a helper function for random setbuilder functions.
		let counter = {
			Physical: 0, Special: 0, Status: 0, damage: 0, recovery: 0, stab: 0, inaccurate: 0, priority: 0, recoil: 0, drain: 0,
			adaptability: 0, bite: 0, contrary: 0, hustle: 0, ironfist: 0, serenegrace: 0, sheerforce: 0, skilllink: 0, technician: 0,
			physicalsetup: 0, specialsetup: 0, mixedsetup: 0, defensesetup: 0, speedsetup: 0, physicalpool: 0, specialpool: 0,
			damagingMoves: [],
			damagingMoveIndex: {},
			setupType: '',
		};

		for (let type in Dex.data.TypeChart) {
			counter[type] = 0;
		}

		if (!moves || !moves.length) return counter;
		if (!hasType) hasType = {};
		if (!hasAbility) hasAbility = {};
		if (!movePool) movePool = [];

		// Moves that heal:
		let RecoveryMove = {
			healorder: 1, milkdrink: 1, recover: 1, roost: 1, slackoff: 1, softboiled: 1, synthesis:1, moonlight:1, morningsun: 1
		};
		// Moves which drop stats:
		let ContraryMove = {
			closecombat: 1, leafstorm: 1, overheat: 1, superpower: 1, vcreate: 1, dragonascent: 1, dracometeor: 1, hammerarm:1,psychoboost:1,hyperspacefury: 1, icehammer: 1,
		};
		// Moves that boost Attack:
		let PhysicalSetup = {
			bellydrum:1, bulkup:1, coil:1, curse:1, dragondance:1, honeclaws:1, howl:1, poweruppunch:1, shiftgear:1, swordsdance:1,
		};
		// Moves which boost Special Attack:
		let SpecialSetup = {
			calmmind:1, chargebeam:1, geomancy:1, nastyplot:1, quiverdance:1, tailglow:1,
		};
		// Moves which boost Attack AND Special Attack:
		let MixedSetup = {
			conversion: 1, growth:1, shellsmash:1, workup:1,
		};
		// Moves which boost Defense and/or Special Defense:
		let DefenseSetup = {
			cosmicpower:1, cottonguard:1, defendorder:1,
		};
		// Moves which boost Speed:
		let SpeedSetup = {
			agility:1, autotomize:1, rockpolish:1,
		};
		// Moves that shouldn't be the only STAB moves:
		let NoStab = {
			aquajet:1, bounce:1, explosion:1, fakeout:1, flamecharge:1, fly:1, iceshard:1, pursuit:1, quickattack:1, skyattack:1,
			chargebeam:1, clearsmog:1, eruption:1, vacuumwave:1, waterspout:1,
		};

		// Iterate through all moves we've chosen so far and keep track of what they do:
		for (let k = 0; k < moves.length; k++) {
			let move = this.getMove(moves[k]);
			let moveid = move.id;
			let movetype = move.type;
			if (moveid === 'judgment' || moveid === 'multiattack') movetype = Object.keys(hasType)[0];
			if (move.damage || move.damageCallback) {
				// Moves that do a set amount of damage:
				counter['damage']++;
				counter.damagingMoves.push(move);
				counter.damagingMoveIndex[moveid] = k;
			} else {
				// Are Physical/Special/Status moves:
				counter[move.category]++;
			}
			// Moves that have a low base power:
			if (moveid === 'lowkick' || (move.basePower && move.basePower <= 60 && moveid !== 'rapidspin')) counter['technician']++;
			// Moves that hit up to 5 times:
			if (move.multihit && move.multihit[1] === 5) counter['skilllink']++;
			if (move.recoil) counter['recoil']++;
			if (move.drain) counter['drain']++;
			// Moves which have a base power, but aren't super-weak like Rapid Spin:
			if (move.basePower > 30 || move.multihit || move.basePowerCallback || moveid === 'naturepower') {
				counter[movetype]++;
				if (hasType[movetype]) {
					counter['adaptability']++;
					// STAB:
					// Certain moves aren't acceptable as a Pokemon's only STAB attack
					if (!(moveid in NoStab) && (moveid !== 'hiddenpower' || Object.keys(hasType).length === 1)) counter['stab']++;
				}
				if (move.priority === 0 && (hasAbility['Protean'] || moves.includes('conversion')) && !(moveid in NoStab)) counter['stab']++;
				if (move.category === 'Physical') counter['hustle']++;
				if (movetype === 'Normal' && !(moveid in NoStab)) {
					if (hasAbility['Aerilate'] || hasAbility['Pixilate'] || hasAbility['Refrigerate']) counter['stab']++;
				}
				if (move.flags['bite']) counter['bite']++;
				if (move.flags['punch']) counter['ironfist']++;
				counter.damagingMoves.push(move);
				counter.damagingMoveIndex[moveid] = k;
			}
			// Moves with secondary effects:
			if (move.secondary) {
				counter['sheerforce']++;
				if (move.secondary.chance >= 20) counter['serenegrace']++;
			}
			// Moves with low accuracy:
			if (move.accuracy && move.accuracy !== true && move.accuracy < 90) counter['inaccurate']++;
			// Moves with non-zero priority:
			if (move.priority !== 0) counter['priority']++;

			// Moves that change stats:
			if (RecoveryMove[moveid]) counter['recovery']++;
			if (ContraryMove[moveid]) counter['contrary']++;
			if (PhysicalSetup[moveid]) counter['physicalsetup']++;
			if (SpecialSetup[moveid]) counter['specialsetup']++;
			if (MixedSetup[moveid]) counter['mixedsetup']++;
			if (DefenseSetup[moveid]) counter['defensesetup']++;
			if (SpeedSetup[moveid]) counter['speedsetup']++;
		}

		// Keep track of the available moves
		for (let i = 0; i < movePool.length; i++) {
			let move = this.getMove(movePool[i]);
			if (move.category === 'Physical') counter['physicalpool']++;
			if (move.category === 'Special') counter['specialpool']++;
		}

		// Choose a setup type:
		if (counter['mixedsetup']) {
			counter.setupType = 'Mixed';
		} else if (counter['physicalsetup'] || counter['specialsetup']) {
			let physical = counter.Physical + counter['physicalpool'];
			let special = counter.Special + counter['specialpool'];
			if (counter['physicalsetup'] && counter['specialsetup']) {
				if (physical === special) {
					counter.setupType = counter.Physical > counter.Special ? 'Physical' : 'Special';
				} else {
					counter.setupType = physical > special ? 'Physical' : 'Special';
				}
			} else if (counter['physicalsetup'] && physical >= 1) {
				if (physical >= 2 || moves.includes('rest') && moves.includes('sleeptalk')) {
					counter.setupType = 'Physical';
				}
			} else if (counter['specialsetup'] && special >= 1) {
				if (special >= 2 || moves.includes('rest') && moves.includes('sleeptalk')) {
					counter.setupType = 'Special';
				}
			}
		}

		return counter;
	}
}
 
module.exports = RandomFusionTeams;