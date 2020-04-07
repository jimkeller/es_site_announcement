var ES_site_announcement = function( announcement_type ) {

	this.type = ( announcement_type ) ? announcement_type : null;

	try {

	}
	catch( e ) {
		throw e;
	}

	/**
	 * Gets the endpoint URL. Respects Drupal.settings.es_site_announcement.api_endpoint_url if set.
	 * 	 
	 */
	ES_site_announcement.prototype.api_endpoint_url = function() {

		try { 

			var endpoint_url = window.location.protocol + '//' + window.location.host + '/api/announcements'; //default endpoint

			if ( typeof(Drupal) != 'undefined' && typeof(Drupal.settings) != 'undefined' ) {
				if ( typeof(Drupal.settings.es_site_announcement) != 'undefined' ) {
					if ( typeof(Drupal.settings.es_site_announcement.api_endpoint_url) != 'undefined' && Drupal.settings.es_site_announcement.api_endpoint_url ) {
						endpoint_url = Drupal.settings.es_site_announcement.api_endpoint_url;
					}
				}
			}

			if ( this.type ) {
				endpoint_url += '/' + this.type;
			}

			var url_cache_busting = true;

			if ( typeof(Drupal.settings.es_site_announcement) != 'undefined' ) {
				if ( typeof(Drupal.settings.es_site_announcement.url_cache_busting) != 'undefined') {
					url_cache_busting = Drupal.settings.es_site_announcement.url_cache_busting;
				}
			}

			if ( url_cache_busting ) {
				endpoint_url += '?' + Date.now().toString();
			}

			return endpoint_url;

		}
		catch( e ) {
			throw e;
		}

	}

	/**
	 * Fetch the announcement data
	 * @return {Promise} a promise for processing after the request has finished
	 */
	ES_site_announcement.prototype.fetch_data = function() {

		try {

			var request = new XMLHttpRequest();
    	var endpoint_url = this.api_endpoint_url();

    	return new Promise(function (resolve, reject) {

	    	request.onreadystatechange = function() {
	        
	        if (request.readyState == 4 ) {
	        	if ( request.status >= 200 && request.status <= 300 ) {

		          try {
								resolve(request);
		          } 
		          catch(e ) {
		            throw e;
		          }            
		        }
		        else {
					 		reject({
								status: request.status,
								statusText: request.statusText
							});
						}
		      }					
	    	};

	    	request.open("GET", endpoint_url, true);
	    	request.send();

	    });
 
		}
		catch( e ) {
			throw e;
		}

	}
}