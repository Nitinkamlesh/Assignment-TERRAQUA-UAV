package com.TerraAqua.demo.client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Component
public class PythonClient {

    public String sendToPython(MultipartFile file) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders ();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            String PYTHON_API = "http://127.0.0.1:8000/process-image";
            ResponseEntity<String> response = restTemplate.postForEntity(PYTHON_API, request, String.class);

            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}