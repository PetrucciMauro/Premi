var LoginPage = function(){
	this.userName = element(by.model('userName'));
	this.password = element (by.model('password'));
	thi.status = element (by.binding('status'));
	this.setUserName = function(value){
	   this.userName.sendKeys(value);
	}
    this.setPassword = function(value){
       this.password.sendKeys(value);

    }
    this.login = function(){
      return element(by.id('loginButton')).click();
    }
    this.get = function(){
       browser.get('http://localhost:8000/app/index.html');
    }

}