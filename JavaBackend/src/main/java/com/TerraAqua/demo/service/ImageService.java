package com.TerraAqua.demo.service;

import com.TerraAqua.demo.client.PythonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

    @Autowired
    private PythonClient pythonClient;

    public Object processImage(MultipartFile file) {
        return pythonClient.sendToPython(file);
    }
}
