(function(){dust.register("openmodal_button.dust",body_0);function body_0(chk,ctx){return chk.write("<a class=\"button oip-controller-command\" data-oip-command=\"OpenModal").reference(ctx.get("modal_name"),ctx,"h").write("\">").exists(ctx.get("icon_class_name"),ctx,{"block":body_1},null).exists(ctx.get("button_label"),ctx,{"block":body_2},null).write("</a>");}function body_1(chk,ctx){return chk.write("<i class=\"").reference(ctx.get("icon_class_name"),ctx,"h").write("\"></i>");}function body_2(chk,ctx){return chk.reference(ctx.get("button_label"),ctx,"h");}return body_0;})();