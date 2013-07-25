function BadWordFilter(connection) {
	var replacements = [];
		connection.query('SELECT bw_name, bw_replacement FROM pxm_badword', function(err, rows) {
			replacements = rows;
			connection.end();
	});

	this.replaceBadWords = function(text) {
		var out = text;
		for(var i = 0; i < replacements.length; i++) {
			var badword = replacements[i].bw_name;
			var replacement = replacements[i].bw_replacement;
			while(out.indexOf(badword) > -1) {
				out = out.replace(badword, replacement);
			}
		}
		return out;
	}
}

module.exports = BadWordFilter;
