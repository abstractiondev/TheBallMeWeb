(function(){dust.register("Modals.dust",body_0);function body_0(chk,ctx){return chk.partial("TextContent_Modals.dust",ctx,null).partial("LinkToContent_Modals.dust",ctx,null).partial("EmbeddedContent_Modals.dust",ctx,null).partial("modal_begin.dust",ctx,{"modal_name":"AlertContentDeleteConfirm"}).write("<h3>Are you sure you want to delete this item?</h3>").partial("hiddeninput.dust",ctx,{"field_name":"ID"}).partial("hiddeninput.dust",ctx,{"field_name":"ObjectName"}).partial("hiddeninput.dust",ctx,{"field_name":"DomainName"}).write("<div name=\"ContentDescription\"/><div class=\"row\" style=\"margin-top: 20px;\"><div class=\"large-12 columns\">").partial("insidemodal_button.dust",ctx,{"command":"Common_CloseOpenModal","button_label":"Cancel","style":"float: right;"}).write("<div style=\"width: 10px;float: right;\">&nbsp;</div>").partial("insidemodal_button.dust",ctx,{"command":"DeleteContent","button_label":"Delete","style":"float:right;font-color:Red"}).write("</div></div>").partial("modal_end.dust",ctx,null);}return body_0;})();