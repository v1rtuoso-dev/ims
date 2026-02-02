package dev.virtuoso.ims.controller;

import dev.virtuoso.ims.dto.request.TemplateRequest;
import dev.virtuoso.ims.service.InterestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/interest")
public class InterestController {

    @Autowired
    private InterestService interestService;

    @PostMapping("/exportTemplate")
    public ResponseEntity<InputStreamResource> exportTemplate(@RequestBody TemplateRequest request) {
        ByteArrayInputStream in = interestService.generateInterestTemplate(request);

        String filename = "interest_import_template.xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}