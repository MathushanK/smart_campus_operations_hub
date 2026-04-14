package com.smartcampus.hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.smartcampus.hub")
public class SmartCampusHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusHubApplication.class, args);
	}

}
