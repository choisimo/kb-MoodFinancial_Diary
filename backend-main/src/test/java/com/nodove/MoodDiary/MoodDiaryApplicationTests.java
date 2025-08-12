package com.nodove.MoodDiary;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@TestPropertySource(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration",
		"infisical.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.main.allow-bean-definition-overriding=true"
})
class MoodDiaryApplicationTests {

	@Test
	void contextLoads() {
	}

}
