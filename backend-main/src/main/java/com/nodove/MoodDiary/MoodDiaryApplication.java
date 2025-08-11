package com.nodove.MoodDiary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MoodDiaryApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoodDiaryApplication.class, args);
	}

}
