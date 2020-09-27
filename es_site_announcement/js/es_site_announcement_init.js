(function (Drupal, $) {
	Drupal.behaviors.es_site_announcement = {
	  attach: function (context, settings) {
	    
	  	if ( context == document ) {

	  		var cookie_domain = '.' + window.location.hostname;
	  		var debug = false;
	  		var announcement_type_data;
	  		var announcement_type_key;

	  		var announcement_types = {
	  		 'banner' : { 'key': 'banner', 'always_show': true },
	  		 'modal': { 'key': 'modal' },
	  		};


	  		if ( typeof(Drupal.settings.es_site_announcement) != 'undefined' ) {
	  			if ( typeof(Drupal.settings.es_site_announcement.cookie_domain) != 'undefined' ) {
	  				cookie_domain = Drupal.settings.es_site_announcement.cookie_domain;
	  			}
					if ( typeof(Drupal.settings.es_site_announcement.debug) != 'undefined' ) {
	  				debug = Drupal.settings.es_site_announcement.debug;
	  			}

	  		}
	  	
	  		for( announcement_type_key in announcement_types ) {
	  			
	  			announcement_type_data = announcement_types[announcement_type_key];

	  				//
	  				// Need to wrap the below in a function otherwise the promise .then fires 
	  				// after the loop has already moved onto the next announcement type, and you get
	  				// unreliable results.
	  				//
	  				let announcement_fetch_data = function( announcement_type_data ) {

							let announcement_obj = new ES_site_announcement(announcement_type_data.key);

				  		announcement_obj.fetch_data()
				  		.then(
				  			function(request) {

				  				let data = JSON.parse(request.responseText);

									if ( typeof(data.announcements) != 'undefined' && data.announcements.length > 0 ) {
										//
										// We only care about the latest announcement for now.
										//
										let announcement = data.announcements[0].announcement;
										let timestamp = parseInt(announcement.timestamp);
			              let timestamp_last_seen= 0;
			              let cookie_name = 'es_site_announcement_' + announcement_type_data.key;
			              let always_show = (typeof(announcement_type_data.always_show) != 'undefined' && announcement_type_data.always_show) ? true : false;

			              if ( $.cookie(cookie_name) ) {
			                timestamp_last_seen = parseInt($.cookie(cookie_name));
			              }

										if ( always_show || debug || timestamp_last_seen < timestamp  ) {

											$.cookie( cookie_name, timestamp, { domain: cookie_domain });

											let function_name = 'handle_announcement_' + announcement_type_data.key;

											return eval( 'handle_announcement_' + announcement_type_data.key + '( announcement );' );

										}

									}
				  			}
				  		)
				  		.catch(
				  			function(error) {
				  				if (typeof(console) != 'undefined' && typeof(console.log) != 'undefined') {
				  					console.log('Error retrieving announcement data', error);
				  				}
				  			}
				  		);
				  	}(announcement_type_data); //call function immediately
			  }

				function handle_announcement_modal( announcement ) {

		  		try {
		  			
						let modal = new tingle.modal({
						    footer: true,
						    stickyFooter: false,
						    closeMethods: ['overlay', 'button', 'escape'],
						    closeLabel: "Close",
						    cssClass: ['announcement-modal', 'announcement-modal--tingle'],
						    onClose: function() {
									if ( document.querySelector('body').getAttribute('data-has-banner-announcement') ) {
										//
										// On android, browser will stay scrolled below the banner for some reason. 
										// Wait until tingle closes then scroll to top.
										//
										setTimeout(
											function() { 
												window.scrollTo(0, 0);
		  									document.querySelector('html').scrollTo(0, 0);
											},
											100
										);
										
									}
    						}
						});

						modal.setContent('<h1>' + announcement.title + '</h1>' + announcement.body);
						modal.addFooterBtn('Got it, thanks!', 'tingle-btn tingle-btn--primary', 
							function() {
						    modal.close();
						  }
						);

						modal.open();

		  		}
		  		catch( e ) {
		  			throw e;
		  		}

		  	}

	  	}

			function handle_announcement_banner( announcement ) {

	  		try {

	  			let banner_container_selector = 'div.viewport';
	  			let banner_insert_before_selector = null;
	  			let banner_container = null;
	  			let banner_animate_in = true;
	  			let insert_before_element = null;
	  			let wait_timeout = 0;

					if ( typeof(Drupal.settings.es_site_announcement) != 'undefined' ) {
		  			if ( typeof(Drupal.settings.es_site_announcement.banner_container_selector) != 'undefined' ) {
		  				banner_container_selector = Drupal.settings.es_site_announcement.banner_container_selector;
		  			}						

		  			if ( typeof(Drupal.settings.es_site_announcement.banner_insert_before_selector) != 'undefined' ) {
		  				banner_insert_before_selector = Drupal.settings.es_site_announcement.banner_insert_before_selector;
		  			}		

		  			if ( typeof(Drupal.settings.es_site_announcement.banner_animate_in) != 'undefined' ) {
		  				banner_animate_in = Drupal.settings.es_site_announcement.banner_animate_in;
		  			}		

		  			if ( typeof(Drupal.settings.es_site_announcement.banner_wait_timeout) != 'undefined' ) {
		  				wait_timeout = parseInt(Drupal.settings.es_site_announcement.banner_wait_timeout);
		  			}		

		  		}

		  		banner_container = document.querySelector(banner_container_selector);

		  		if ( !banner_container ) {
		  			throw "Could not find selector for banner: " + banner_container_selector;
		  		}

					let banner_element = document.createElement('div');
					let boundary_element = document.createElement('div');
		  		let title_element  = document.createElement('div');
		  		let body_element  = document.createElement('div');
		  		let close_element = document.createElement('div');

		  		document.querySelector('body').setAttribute('data-has-banner-announcement', true);

		  		banner_element.className = 'announcement-banner--site';

		  		if ( banner_animate_in ) {
		  			banner_element.style.height = '0';
		  		}

		  		boundary_element.className = 'announcement-banner__boundary';

		  		title_element.className = 'announcement-banner__title';
		  		title_element.innerText = announcement.title;

		  		body_element.className = 'announcement-banner__body';
		  		body_element.innerHTML = announcement.body;

		  		close_element.className = 'announcement-banner__close';
					close_element.innerHTML = '<a>X</a>';

					close_element.addEventListener('click',
						function() {
							banner_element.style.display = 'none';
						}
					);

					if ( typeof(announcement.show_title) == 'undefined' || announcement.show_title == true ) {
						boundary_element.appendChild(title_element);
					}
		  		boundary_element.appendChild(body_element);
		  		boundary_element.appendChild(close_element);

		  		banner_element.appendChild(boundary_element);

		  		if ( banner_insert_before_selector ) {
		  			insert_before_element = document.querySelector('banner_insert_before_selector');
		  		}

		  		if ( !insert_before_element ) {
						insert_before_element = banner_container.firstChild;
					}

					setTimeout (
						function() {

							var html_element = document.querySelector('html');
				  		banner_container.insertBefore(banner_element, insert_before_element);

				  		if ( banner_animate_in ) {

				  			banner_element.addEventListener( 'transitionend', 
				  				function() {
				  					this.style.height = 'auto';
				  					window.scrollTo(0, 0);

				  					if ( typeof(html_element.scrollTo) != 'undefined' ) {
				  						html_element.scrollTo(0, 0);
				  					}
				  					else {
				  						if ( typeof(html_element.scrollTop) != 'undefined' ) {
				  							html_element.scrollTop = 0;
				  						}
				  					}

				  					if ( typeof(window.es_site_announcement) != 'undefined' && typeof(window.es_site_announcement.callbacks.afterDisplay) != 'undefined') {
				  						window.es_site_announcement.callbacks.afterDisplay.call(this, { 'banner_element': banner_element });
				  					}
				  				}
				  			);

				  			window.scrollTo(0, 0);

		  					if ( typeof(html_element.scrollTo) != 'undefined' ) {
		  						html_element.scrollTo(0, 0);
		  					}
		  					else {
		  						if ( typeof(html_element.scrollTop) != 'undefined' ) {
		  							html_element.scrollTop = 0;
		  						}
		  					}
				  			
				  			banner_element.style.height = banner_element.scrollHeight.toString() + 'px';
				  		}
				  		else {
				  			if ( typeof(window.es_site_announcement) != 'undefined' && typeof(window.es_site_announcement.callbacks.afterDisplay) != 'undefined') {
									window.es_site_announcement.callbacks.afterDisplay.call(banner_element, { 'banner_element': banner_element });
				  			}
				  		}

						},
						wait_timeout
					);


	  		}
	  		catch( e ) {
	  			throw e;
	  		}

	  	}

	  }
	};
}(Drupal, jQuery));
