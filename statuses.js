'use strict';

exports.BattleStatuses = {
	arceus: {
		onSwitchInPriority: 101,
		onSwitchIn: function (pokemon) {
			let type = pokemon.types;
			if (pokemon.ability === 'multitype') {
				type[0] = pokemon.getItem().onPlate;
				if (!type[0] || type[0] === true) {
					type = pokemon.types;
				}
			}
			pokemon.setType(type, true);
		},
	},
	silvally: {
		onSwitchInPriority: 101,
		onSwitchIn: function (pokemon) {
			let type = pokemon.types;
			if (pokemon.ability === 'rkssystem') {
				type[0] = pokemon.getItem().onMemory;
				if (!type[0] || type[0] === true) {
					type = pokemon.types;
				}
			}
			pokemon.setType(type, true);
		},
	},
};
