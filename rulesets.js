'use strict';

exports.BattleFormats = {
	pokemon:{
	effectType: 'ValidatorRule',
	name: 'Pokemon',
	onValidateTeam: function (team, format) {
			let nameTable = {};
			for (let i = 0; i < team.length; i++) {
				let species = team[i].baseSpecies?team[i].baseSpecies:team[i].species;
				if(!(species in nameTable)) {nameTable[species] = 1;}
				else if(nameTable[species]<1){nameTable[species]++;}
				else {return ["(You have more than one " + species + ")"];}
				if (!team[i].name) continue;
				let name = this.getTemplate(team[i].name.substring(1,20)).baseSpecies!=undefined ? ''+this.getTemplate(team[i].name.substring(1,20)).baseSpecies:team[i].name.substring(1,20);
				if (!(name in nameTable)) {
					nameTable[name] = 1;
				} else if (nameTable[name] < 1) {
					nameTable[name]++;
				} else {
					return ["You have more than one " + name];
				}
			}
		},
		onValidateSet: function (set, format) {
		 	let item = this.getItem(set.item);
			let template = this.getTemplate(set.species);
			let problems = [];
			let totalEV = 0;
			let template1 = this.getTemplate(set.species);
			let name=set.species;
			let template2 = template1;

			if ((template.num === 25 || template.num === 172) && template.tier === 'Illegal') {
				problems.push(set.species + ' does not exist outside of gen ' + template.gen + '.');
			}
			if (set.moves && set.moves.length > 4) {
				problems.push((set.name || set.species) + ' has more than four moves.');
			}
			if (set.level && set.level > 100) {
				problems.push((set.name || set.species) + ' is higher than level 100.');
			}

			if (item.isNonstandard) {
				if (item.isNonstandard === 'gen2') {
					problems.push(item.name + ' does not exist outside of gen 2.');
				} 
			}

			for (let k in set.evs) {
				if (typeof set.evs[k] !== 'number' || set.evs[k] < 0) {
					set.evs[k] = 0;
				}
				totalEV += set.evs[k];
			}
			// In gen 6, it is impossible to battle other players with pokemon that break the EV limit
			if (totalEV > 510 && this.gen === 6) {
				problems.push((set.name || set.species) + " has more than 510 total EVs.");
			}

			// ----------- legality line ------------------------------------------
			// everything after this line only happens if we're doing legality enforcement

			// only in gen 1 and 2 it was legal to max out all EVs
			if (this.gen >= 3 && totalEV > 510) {
				problems.push((set.name || set.species) + " has more than 510 total EVs.");
			}

			if (template.gender) {
				if (set.gender !== template.gender) {
					set.gender = template.gender;
				}
			} else {
				if (set.gender !== 'M' && set.gender !== 'F') {
					set.gender = undefined;
				}
			}

			// limit one of each move
			let moves = [];
			if (set.moves) {
				let hasMove = {};
				for (let i = 0; i < set.moves.length; i++) {
					let move = this.getMove(set.moves[i]);
					let moveid = move.id;
					if (hasMove[moveid]) continue;
					hasMove[moveid] = true;
					moves.push(set.moves[i]);
				}
			}
			set.moves = moves;

			let battleForme = template.battleOnly && template.species;
			if (battleForme) {
				if (template.requiredAbility && set.ability !== template.requiredAbility) {
					problems.push("" + template.species + " transforms in-battle with " + template.requiredAbility + "."); // Darmanitan-Zen, Zygarde-Complete
				}
				if (template.requiredItems && !template.requiredItems.includes(item.name)) {
					problems.push("" + template.species + " transforms in-battle with " + Chat.plural(template.requiredItems.length, "either ") + template.requiredItems.join(" or ") + '.'); // Mega or Primal
				}
				if (template.requiredMove && set.moves.indexOf(toId(template.requiredMove)) < 0) {
					problems.push("" + template.species + " transforms in-battle with " + template.requiredMove + "."); // Meloetta-Pirouette, Rayquaza-Mega
				}
				set.species = template.baseSpecies; // Fix forme for Aegislash, Castform, etc.
			} else {
				if (template.requiredAbility && set.ability !== template.requiredAbility) {
					problems.push("" + (set.name || set.species) + " needs the ability " + template.requiredAbility + "."); // No cases currently.
				}
				if (template.requiredItems && !template.requiredItems.includes(item.name)) {
					problems.push("" + (set.name || set.species) + " needs to hold " + Chat.plural(template.requiredItems.length, "either ") + template.requiredItems.join(" or ") + '.'); // Memory/Drive/Griseous Orb/Plate/Z-Crystal - Forme mismatch
				}
				if (template.requiredMove && set.moves.indexOf(toId(template.requiredMove)) < 0) {
					problems.push("" + (set.name || set.species) + " needs to have the move " + template.requiredMove + "."); // Keldeo-Resolute
				}

			}

			if (template.species === 'Pikachu-Cosplay') {
				let cosplay = {meteormash:'Pikachu-Rock-Star', iciclecrash:'Pikachu-Belle', drainingkiss:'Pikachu-Pop-Star', electricterrain:'Pikachu-PhD', flyingpress:'Pikachu-Libre'};
				for (let i = 0; i < set.moves.length; i++) {
					if (set.moves[i] in cosplay) {
						set.species = cosplay[set.moves[i]];
						break;
					}
				}
			}

			if (set.species !== template.species) {
				// Autofixed forme.
				template = this.getTemplate(set.species);

			}
			global.TeamValidator = require('../../team-validator.js');
			let lsetData = {set:set, format:'gen7ou'};
			if(set.name != undefined|set.name != null)
				{
				name=set.name.substring(1,20);
				template2 = this.getTemplate(set.name.substring(1,20));
				}
			if(!template2.exists)
				{
				template2=template1;
				name=set.species;
				}
			let ability = this.getAbility(set.ability);
			let abilityAfterMega;
			if(this.getItem(set.item).megaEvolves==set.species)
			{
			abilityAfterMega = this.getAbility(this.getTemplate(this.getItem(set.item).megaStone).abilities[0]);
			}
			moves = set.moves;
			let StatsSum0=0;
			let StatsSum1=0;
			let abilityList=[];
			let originTemplate1=this.getTemplate(template1.baseSpecies);
			let originTemplate2=this.getTemplate(template2.baseSpecies);
			if(template1.isMega) abilityList=Object.values(template1.abilities).concat(Object.values(originTemplate1.abilities)); else abilityList=Object.values(template1.abilities);
			if(template1!=undefined&template2!=undefined&template1!=null&template2!=null&template1!=template2)
				{
				abilityList=abilityList.concat(Object.values(template2.abilities));
				if(template2.isMega) problems.push("Using Mega-Pokemons in fusion is banned");
					if ((!abilityList.includes(ability.name))) problems.push(""+set.species+" has illegal ability: "+ ability.name);
					for (let z in moves) 
						{
						if((TeamValidator('gen7ou').checkLearnset(this.getMove(moves[z]).id, !template1.learnset? originTemplate1.species:template1.species, lsetData))&(TeamValidator('gen7ou').checkLearnset(this.getMove(moves[z]).id), !template2.learnset? originTemplate2.species:template2.species, lsetData)) problems.push(""+set.species+" has illegal move: "+moves[z]);
						}
					if(ability.id=='powerconstruct'&&(template.speciesid=='zygarde'||template.speciesid=='zygarde10'))  template1=this.getTemplate('zygardecomplete');
					if(ability.id=='schooling'&&template.speciesid=='wishiwashi') template1=this.getTemplate('wishiwashi-school');
					for(let a in template1.baseStats)
						{
						StatsSum0+=(this.getItem(set.item).megaEvolves==set.species)?this.getTemplate(this.getItem(set.item).megaStone).baseStats[a]:template1.baseStats[a];
						
						StatsSum1+=template2.baseStats[a];
						}
				if(ability.id=='hugepower'||ability.id=='purepower') {StatsSum0+=template1.baseStats.atk;StatsSum1+=template2.baseStats.atk;}
				if(ability.id=='furcoat') {StatsSum0+=template1.baseStats.def;StatsSum1+=template2.baseStats.def;}
					if(template1!=template2&(StatsSum0+StatsSum1)/2>600|(template1.tier=='Uber'&template2.tier=='Uber'))
						{
						problems.push("Fusion of "+template1.species+" and "+template2.species+" is banned, because"+(((StatsSum0+StatsSum1)/2>600)?' sum of stats is higher than 600':((template1.tier=='Uber'&template2.tier=='Uber')?(' they are both Uber'):'')));
						}
					if(template2.battleOnly&&template2.species!='Wishiwashi-School')
					{
					problems.push("Fusion of "+template2.species+" is banned, because this is battle forme");
					}
				}
			else
				{
				if (!abilityList.includes(ability.name)) return [""+set.species+" has illegal ability: "+ ability.name];
				for (let z in moves) 
					{
					if(TeamValidator('gen7ou').checkLearnset(this.getMove(moves[z]).id, !template1.learnset? originTemplate1.species:template1.species, lsetData)) problems.push(""+set.species+" has illegal move: "+moves[z]);
					}
				if (template1.tier=='Uber') problems.push(""+set.species+" in Uber which is banned");
				}
				//Complicate Banlist
				//if(ability.id=='speedboost'&((StatsSum0+StatsSum1)/2>500|set.item=='medichamite'|set.item=='mawilite')) problems.push(''+ability.name+ ' + sum of stats >500 or Medichamite/Mawilite' + ' is banned');
				//if(ability.id=='imposter'&template1!=template2)problems.push('Imposter is legal only for Ditto');
				//if((ability.id=='purepower'|ability.id=='hugepower')&((StatsSum0+StatsSum1)/2>500)) problems.push(''+ability.name+ ' + sum of stats >500' + ' is banned');
				if(template2!=template1&template2.exists)
				{
					switch(ability.id)
					{
						case 'speedboost': case 'protean': case 'fluffy': case 'arenatrap':
					    problems.push('Ability ' + ability.name + ' is banned in fusions');
						break;
						case 'imposter':
						if(set.item.id=='eviolite') problems.push('Ability ' + ability.name + ' in combination with Eviolite is banned');
						break;
					}
				}
				if(ability.id=='wonderguard'&&template1.speciesid!='shedinja') problems.push(''+ability.name+ ' is legal only for Shedinja');
				//Pokemons' Banlist
				if(this.getTemplate(set.species).tier=='Illegal') return [ "" + set.species + ' is illegal']
				if(this.getTemplate(set.species).tier=='Unreleased') return [ "" + set.species + ' is unreleased']
				//Moves' Banlist
				for(let z in moves)
					{
					let move=this.getMove(moves[z]);
					if(moves[z]=='vcreate'&&ability.id=='contrary') problems.push('Combination of '+ move.name + ' and ' + ability.name + ' is banned');
					if(moves[z]=='sleeptalk'&&ability.id=='comatose') problems.push('Combination of '+ move.name + ' and ' + ability.name + ' is banned');
					if((moves[z]=='nightshade'||moves[z]=='seismictoss'||moves[z]=='psywave')&(abilityAfterMega=='parentalbond'||ability=='parentalbond')) problems.push('Combination of '+ move.name + ' and Parental Bond is banned');
					if(move.accuracy<100&move.status=='slp'&(ability.id=='noguard'||(abilityAfterMega&&abilityAfterMega.id=='noguard'))) problems.push('Combination of '+ move.name + ' and No Guard is banned');
					}
					return problems;
		},


		},


	fusion:
	{
	effectType: 'Rule',
	name: 'Fusion',
		onUpdate: function (pokemon) {		
			if(pokemon.name!=undefined)
			{
				let d=this.data['Pokedex'];
				let name=pokemon.name.substring(1,20);
				let template2 = this.getTemplate(pokemon.name.substring(1,20));
				if(!template2.exists)
				{
					name=pokemon.species;
					template2 =  pokemon.template;
				}
				if(this.getTemplate(pokemon.name.substring(1,20)).exists&pokemon.species!=this.getTemplate(pokemon.name.substring(1,20))&!pokemon.getVolatile('hybride')&!pokemon.transformed)
					{
					let new_types=d[pokemon.template.speciesid].types;
					if(pokemon.template.isMega&!pokemon.getVolatile('megafusion'))
						{	
						let stats={};
						for(let stat in pokemon.template.baseStats)
							{
							stats[stat]=(d[pokemon.template.speciesid].baseStats[stat]+d[template2.speciesid].baseStats[stat])/2;
							}
						pokemon.addVolatile('megafusion');
						let new_stats=this.spreadModify(stats, pokemon.set);
						pokemon.baseStats=new_stats;
						}
					if(d[template2.speciesid].types!=pokemon.types&!pokemon.transformed)
						{
						if(d[template2.speciesid].types[1]!=undefined)
							{
							let f=d[pokemon.template.speciesid].types[0];
							let s=d[template2.speciesid].types[1];
							new_types={f,s};
							}
						else
							{
							let f=d[pokemon.template.speciesid].types[0];
							let s=d[template2.speciesid].types[0];
							new_types={f,s};
							}
						}
					if(new_types.f==new_types.s)
						{
						delete new_types.s;
						}
					pokemon.types=Object.values(new_types);
					this.add('-start', pokemon, 'typechange', pokemon.types.join('/'), '[silent]');
					if(!pokemon.transformed)
						{
						this.add('html', `<b>${""+pokemon.species+" + "+d[template2.speciesid].species+' base stats:'}</b>`);
						if(template2.exists)
							{
							let baseStatsFusion={};
							for(let i in pokemon.baseStats)
								{
								baseStatsFusion[i]=Math.round((d[pokemon.template.speciesid].baseStats[i]+d[template2.speciesid].baseStats[i])/2);
								}
								let baseStatsFusionText=`<table><tr><b><th>HP</th><th>Attack</th><th>Defense</th><th>Sp.Attack</th><th>Sp.Defense</th><th>Speed</th></b></tr> <tr><td>${baseStatsFusion['hp']}</td><td>${baseStatsFusion['atk']}</td><td>${baseStatsFusion['def']}</td><td>${baseStatsFusion['spa']}</td><td>${baseStatsFusion['spd']}</td><td>${baseStatsFusion['spe']}</td></tr></table>`;
								//let baseStatsFusionText=`<b>${'HP:'}</b>${baseStatsFusion['hp']}<b>${' Attack:'}</b>${baseStatsFusion['atk']}<b>${' Defense:'}</b>${baseStatsFusion['def']}<b>${' Sp.Attack:'}</b>${baseStatsFusion['spa']}<b>${' Sp.Defense:'}</b>${baseStatsFusion['spd']}<b>${' Speed:'}</b>${baseStatsFusion['spe']}`;
								this.add('html', `<font size=0.95 color=#5c5c8a>${baseStatsFusionText}</font>`);
							}
						}
					pokemon.addVolatile('hybride');
					}
			}
		},
	},
	teampreview: {
		effectType: 'Rule',
		name: 'Team Preview',
		onStartPriority: -11,
		onStart: function () {
			this.add('clearpoke');
			for (let i = 0; i < this.sides[0].pokemon.length; i++) {
				let pokemon = this.sides[0].pokemon[i];
				let details = pokemon.details.replace(/(Arceus|Gourgeist|Genesect|Pumpkaboo|Silvally)(-[a-zA-Z?]+)?/g, '$1-*');
				this.add('poke', pokemon.side.id, details, pokemon.item ? 'item' : '');
			}
			for (let i = 0; i < this.sides[1].pokemon.length; i++) {
				let pokemon = this.sides[1].pokemon[i];
				let details = pokemon.details.replace(/(Arceus|Gourgeist|Genesect|Pumpkaboo|Silvally)(-[a-zA-Z?]+)?/g, '$1-*');
				this.add('poke', pokemon.side.id, details, pokemon.item ? 'item' : '');
			}
			this.add('html',`<font color=#18334e><b>${this.p1.name+'\'s team:'}</b></font>`); 
			let pokemonlist=[];
			let pokemonlist2=[];
			for(let p in this.p1.pokemon)
			{
				if(this.p1.pokemon[p].name&&this.getTemplate(this.p1.pokemon[p].name.substring(1,20)).exists)pokemonlist[p]=this.p1.pokemon[p].species+'+'+this.getTemplate(this.p1.pokemon[p].name.substring(1,20)).species; 
			}
			this.add('html',`  <div style="padding: 0px 0px 0px 0px;margin-Bottom: 8px;margin-Left: 15px;margin-Top=0";fontSize=12><font color=#254d74>${pokemonlist.join(' / ')}</font></div>`);
			this.add('html',`<b><font color=#73264b>${this.p2.name+'\'s team:'}</font></b>`); 
			for(let p in this.p2.pokemon)
			{
				if(this.p2.pokemon[p].name&&this.getTemplate(this.p2.pokemon[p].name.substring(1,20)).exists)pokemonlist2[p]=this.p2.pokemon[p].species+'+'+this.getTemplate(this.p2.pokemon[p].name.substring(1,20)).species; 
			}
			this.add('html',` <div style="padding: 0px 0px 0px 0px;margin-Bottom: 8px;margin-Left: 15px;margin-Top=0";fontSize=12><font color=#993364> ${pokemonlist2.join(' / ')}</font></div>`);
			},
			onTeamPreview: function () {
			this.makeRequest('teampreview');
		},
	},
	
	}

