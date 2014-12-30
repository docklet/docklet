package com.demo;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.util.Streams;
import org.apache.struts2.ServletActionContext;

public class FileAction {

	private File[] uploadFiles;

	private String[] uploadFileNames;

	private String[] uploadContentTypes;

	public File[] getUploadFiles() {
		return uploadFiles;
	}

	public void setUploadFiles(File[] uploadFiles) {
		this.uploadFiles = uploadFiles;
	}

	public String[] getUploadFileNames() {
		return uploadFileNames;
	}

	public void setUploadFileNames(String[] uploadFileNames) {
		this.uploadFileNames = uploadFileNames;
	}

	public String[] getUploadContentTypes() {
		return uploadContentTypes;
	}

	public void setUploadContentTypes(String[] uploadContentTypes) {
		this.uploadContentTypes = uploadContentTypes;
	}

	HttpServletResponse response = ServletActionContext.getResponse();
	String fileBasePath = ServletActionContext.getServletContext().getRealPath(
			"/");

	public void uploadImage() throws IOException {
		response.setCharacterEncoding("utf-8");
		File images = new File(fileBasePath + "/user_images_dir/");
		if (!images.exists())
			images.mkdirs();
		BufferedInputStream bis = null;
		BufferedOutputStream bos = null;
		for (int i = 0, size = uploadFiles.length; i < size; i++) {
			File file = uploadFiles[i];
			try {
				bis = new BufferedInputStream(new FileInputStream(file));
				String imageName = new Date().getTime() + ".png";
				bos = new BufferedOutputStream(new FileOutputStream(new File(
						images.getPath() + "/" + imageName)));
				Streams.copy(bis, bos, true);

			} catch (Exception e) {
				response.getWriter().print("Upload Error!");
				e.printStackTrace();
			}
		}

		try {
			response.getWriter().print("{data:'success',success:true}");
		} catch (IOException e) {
		}
	}
}
