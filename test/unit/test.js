describe('testing login',function(){
   it('should successfully login user',function(){

   	 var loginPage = new LoginPage();
   	 loginPage.get();
   	 loginPage.setUserName('gschenker');
   	 loginPage.setPassword('secret');
   	 login.Page.login().then(function(){
   	 	expect(loginPage.status.getText()).toEqual('Status: Logged in');

   	 });
   })

})