describe('Premi Home page test', function(){
        var randVal = Date.now();
		//nome casuale da dare alla presentazione
		var slideshowName='presentation-' + randVal;
		var slideName = element(by.binding('slide.titolo'));
		


	it('should create a new empty presentation',function(){


		//effettuo la login e poi accedo alla home 
		browser.get('http://localhost:8081/#/login');
		element(by.model('user.username')).sendKeys('testHome');
		element(by.model('user.password')).sendKeys('password');
		element( by.css('[ng-click="login()"]')).click();
		//premo il pulsante nuova presentazione	
		element( by.css('[ng-click="newSS = !newSS"]')).click();
		element(by.model('slideshow.name')).sendKeys(slideshowName);

		element( by.css('[ng-click="createSlideShow()"]')).click();
        //verifico che la presentazione sia stata creata correttamente

		expect(slideName.getText()).toEqual(slideshowName);

		



			});
	it('should edit a presentation',function(){
       

		element( by.css('[ng-click="goEdit(slide.titolo)"]')).click();
		expect(element(by.id('slideShowMenu')).isPresent()).toBe(true);

	});

	it('should delete a presentation',function(){
		browser.get('http://localhost:8081/index.html#/private/home');
		element( by.css('[ng-click="deleteSlideShow(slide.titolo)"]')).click();
		browser.switchTo().alert().then(function(alert) {
			return alert.accept();
		});
        expect(element(by.id('slide')).isPresent()).toBe(false);

	});

});