define(function () {

	function Taxon (id, level) {

	    this.id = id;
	    this.level = (parseInt(level));
	    this.name = null;
	    this.count = null;
	    this.tree = null;
	    this.levels = new Array("domain", "kingdom", "phylum", "class", "_order", "family", "genus", "species", "subspecies");
	    this.levelsId = new Array("domain", "kingdom", "phylum", "class", "_order", "familyid", "genusid", "speciesid", "subspeciesid");
	    this.downloadFields = {
	            // "fieldname": "alias" (if null, no alias)
	            "institutioncode": "institutionCode",
	            //"collectioncode": "collectionCode",
	            "catalognumber": "catalogNumber",
	            "subspecies": "scientificName",
	            "basisofrecord": "specimen/observation",
	            "kingdom": null,
	            "phylum": null,
	            "class": null,
	            "_order": "order",
	            "family": "family",
	            //"genus": "genus",
	            //"specificepithet": "specificEpithet",
	            //"infraspecificepithet": "infraSpecificEpithet",
	            //"scientificnameauthorship": "scientificNameAuthorship",
	            "identifiedby": "identifiedBy",
	            //"dateidentified": "dateIdentified",
	            "typestatus": "typeStatus",
	            "eventdate": "eventDate",
	            "countrycode": "countryCode",
	            //"stateprovince": "stateProvince",
	            "locality": null,
	            "decimallongitude": "decimalLongitude",
	            "decimallatitude": "decimalLatitude",
	            "coordinateuncertaintyinmeters": "coordinateUncertaintyInMeters",
	            "minimumelevationinmeters": "minimumElevationInMeters",
	            //"maximumelevationinmeters": "maximumElevationInMeters",
	            "minimumdepthinmeters": "minimumDepthInMeters",
	            "the_geom": null
	    }
	}

	Taxon.prototype.getSqlFields = function(limit) {
		if (limit) {
            if (limit == 'parent') limit = this.level;
			else limit = this.level + 1;
        } else {
			limit = this.level + 1;
		}
	    var sqlSelect = "";
	    // we select only until parents and immediate children (if they exist)
	    for(var i = 0; i <= limit; i++) {
	        if(this.levels[i]) {
	            if(sqlSelect) sqlSelect += ",";
	            //both levels and levels id
	            sqlSelect += this.levels[i];
	            if(this.levelsId[i] != this.levels[i]) sqlSelect += ","+this.levelsId[i];
	        }
	    }

	    return sqlSelect;
	};

	Taxon.prototype.getSqlWhere = function() {
	    return " where " + this.levelsId[this.level] + "='" + this.id + "'";
	};

	Taxon.prototype.convertFromApi = function(result) {
	    var children = new Array();

	    //add children
	    for(var i = 0; i < result.length; i++) {
	        children[i] = this.convertElement(result[i], this.level + 1);
	    }

	    //add active taxon
	    var taxon = this.convertElement(result[0], this.level);
	    taxon.children = children;

	    //add parents recursively
	    for(var j = this.level -1; j >= 0 ; j--) {
	        taxon = this.addParent(taxon, j, result);
	    }
	    this.tree = taxon;
	};

	Taxon.prototype.isIndeterminate = function(id) {
		if(!id) return false;
		// we have no other way to check if it is indeterminate taxon, because
		// in species and subspecies 'name' is always full (genus + specificEpithet)
		// in the future, 'indeterminate' should be an extra field get by JSON
		return (id.slice(-1) == ":");
	};

	Taxon.prototype.transformIndeterminateName = function(name) {
		return name + " [indet.]";
	};

	Taxon.prototype.convertElement = function(row, level) {
	    var el = new Object();
	    el.id = row[this.levelsId[level]];
	    el.count = row["count"];
	    el.name = row[this.levels[level]];
		if (this.isIndeterminate(el.id)) {
            var name = row[this.levels[level-1]]; // we use name of parent
			el.name = this.transformIndeterminateName(name);
        }
	    el.parent = row[this.levelsId[level-1]];
	    return el;
	};

	Taxon.prototype.addParent = function(children, num, cartoResult) {
	    var parent = this.convertElement(cartoResult[0], num);
	    parent.children = new Array();
	    parent.children[0] = children;
	    return parent;
	};

	Taxon.prototype.getId = function() {
	    return this.id;
	};

	Taxon.prototype.getJSONValues = function (data, level, i) {
	    if(!i) i = 0;
	    if(level == i) return data;
	    else return this.getJSONValues(data['children'][0], level, i+1);
	};


	Taxon.prototype.getParent = function() {
	    return (this.level == 0) ? null : this.getJSONValues(this.tree, this.level-1);
	};

	Taxon.prototype.getChild = function() {
	    return (this.level == (this.levels.length -1)) ? null : this.getJSONValues(this.tree, this.level);
	};

	Taxon.prototype.getName = function() {
	    var child = this.getChild();
	    if(child) {
	        return child['name'];
	    } else {
	        var parent = this.getParent();
	        return parent['children'][0]['name'];
	    }
	};

	Taxon.prototype.getSqlDownload = function(format) {
	    var sqlSelect = "";
	    for (var prop in this.downloadFields) {
	        // important check that this is objects own property
	        // not from prototype prop inherited
	        if(this.downloadFields.hasOwnProperty(prop)){
				if (format && format == 'csv' && prop == 'the_geom') {
                    //hack: avoid the_geom for CSV
					continue;
                }
				if(sqlSelect) sqlSelect += ", ";
				sqlSelect += prop;
				if(this.downloadFields[prop]) sqlSelect += " AS \"" + this.downloadFields[prop] + "\"";
	        }
	     }

	    return sqlSelect;
	}

	return Taxon;
});
