describe('Premi edit page controller',function(){
   
   		//effettuo la login e poi accedo alla home 
    


    

	it('should add a frame to the presentation', function(){


		browser.get('http://localhost:8081/#/login');
		element(by.model('user.username')).sendKeys('testEdit');
		element(by.model('user.password')).sendKeys('password');
		element( by.css('[ng-click="login()"]')).click();
		element( by.css('[ng-click="goEdit(slide.titolo)"]')).click();
        
        element(by.css('[ng-click="$mdOpenMenu()"]')).click();
        element(by.css('[ng-click="inserisciFrame()"]')).click();
        expect(element(by.id('frames')).isPresent()).toBe(true);
        expect(element(by.id('1')).isPresent()).toBe(true);
  
	});

	/*it('should move the frame',function(){
     var frame=element(by.id('0'));
     browser.actions().mouseMove(element(by.id('0'))).perform();

     //browser.actions().mouseMove(frame.find()).perform();
     //browser.actions().click(protractor.Button.LEFT).perform();

	});*/

});