(function(){dust.register("DynamicContentGroupEditView.dust",body_0);function body_0(chk,ctx){return chk.write("<form><div class=\"small-12 medium-12 large-12 columns\"><h5 class=\"boldieText\">").reference(ctx.get("GroupHeader"),ctx,"h").write("</h5></div>").section(ctx.get("Items"),ctx,{"block":body_1},null).write("<!--Closes the div researchPageSave&PreviewAllDIV--></form>");}function body_1(chk,ctx){return chk.write("<div class=\"small-12 medium-12 large-12 columns\"><label><span class=\"boldieText darkTextColor\">").reference(ctx.get("Title"),ctx,"h").write("</span>").helper("select",ctx,{"block":body_2},{"key":ctx.get("EditType")}).write("</label></div>");}function body_2(chk,ctx){return chk.helper("eq",ctx,{"block":body_3},{"value":"RICHTEXT"}).helper("eq",ctx,{"block":body_4},{"value":"RAWLINE"}).helper("eq",ctx,{"block":body_5},{"value":"RAWMULTILINE"}).helper("eq",ctx,{"block":body_6},{"value":"IMAGESMALL"}).helper("eq",ctx,{"block":body_7},{"value":"IMAGELARGE"}).helper("eq",ctx,{"block":body_8},{"value":""});}function body_3(chk,ctx){return chk.write("<textarea data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" data-contentetag=\"").reference(ctx.get("MasterETag"),ctx,"h").write("\" data-contentrelativelocation=\"").reference(ctx.get("RelativeLocation"),ctx,"h").write("\"title=\"").reference(ctx.get("Description"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-richtextarea\"style=\"height: 75px;\">").reference(ctx.get("Content"),ctx,"h").write("</textarea><br>");}function body_4(chk,ctx){return chk.write("<input type=\"text\" data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" data-contentetag=\"").reference(ctx.get("MasterETag"),ctx,"h").write("\" data-contentrelativelocation=\"").reference(ctx.get("RelativeLocation"),ctx,"h").write("\"title=\"").reference(ctx.get("Description"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-inputtext\" value=\"").reference(ctx.get("RawContent"),ctx,"h").write("\">");}function body_5(chk,ctx){return chk.write("<textarea data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" data-contentetag=\"").reference(ctx.get("MasterETag"),ctx,"h").write("\" data-contentrelativelocation=\"").reference(ctx.get("RelativeLocation"),ctx,"h").write("\"title=\"").reference(ctx.get("Description"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-textarea\" rows=\"10\">").reference(ctx.get("RawContent"),ctx,"h").write("</textarea>");}function body_6(chk,ctx){return chk.write("<a style=\"padding: 7px;margin: 3px\" class=\"button small oipfile\" data-oipfile-buttontype=\"select\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\">Select</a><a style=\"padding: 7px;margin: 3px\" class=\"button small oipfile\" data-oipfile-buttontype=\"remove\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\">Remove</a><br><img style=\"height: 128px\" class=\"oipfile\" src=\"../assets/controlpanel/images/lightGray.jpg\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\"data-oipfile-noimageurl=\"../assets/controlpanel/images/lightGray.jpg\"><input type=\"file\" data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-imageinput\" name=\"ImageDataFileInput").reference(ctx.get("ID"),ctx,"h").write("\">");}function body_7(chk,ctx){return chk.write("<br><a style=\"padding: 10px;margin: 3px\" class=\"button small oipfile\" data-oipfile-buttontype=\"select\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\">Select</a><a style=\"padding: 10px;margin: 3px\" class=\"button small oipfile\" data-oipfile-buttontype=\"remove\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\">Remove</a><br><img style=\"height: 512px\" class=\"oipfile\" src=\"../assets/controlpanel/images/lightGray.jpg\" data-oipfile-filegroupid=\"Image").reference(ctx.get("ID"),ctx,"h").write("\"data-oipfile-noimageurl=\"../assets/controlpanel/images/lightGray.jpg\"><input type=\"file\" data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-imageinput\" name=\"ImageDataFileInput").reference(ctx.get("ID"),ctx,"h").write("\"><br><br><br>");}function body_8(chk,ctx){return chk.write("<input type=\"text\" data-contentid=\"").reference(ctx.get("ID"),ctx,"h").write("\" data-contentetag=\"").reference(ctx.get("MasterETag"),ctx,"h").write("\" data-contentrelativelocation=\"").reference(ctx.get("RelativeLocation"),ctx,"h").write("\"title=\"").reference(ctx.get("Description"),ctx,"h").write("\" class=\"oipdynamiceditinput oipdynamicedit-inputtext\" value=\"").reference(ctx.get("RawContent"),ctx,"h").write("\"/>");}return body_0;})();