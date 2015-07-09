
        $( "#file_form" ).change(function() {
                                 var  name= (($('input[type=file]').val()).split('\\'))[2];
                                 $("#file_form").attr('name', name);
                              });
