def getRepo(){
            String name = "${env.JOB_NAME}";
            String[] value = name.split('/');
            return value[0];
}

def gitCredentials = "JenkinsGithub"

pipeline {
    parameters {
          booleanParam(defaultValue: true, description: 'Execute pipeline?', name: 'shouldBuild')
       }
  agent any
  stages {
        stage("Check if should build"){
        steps{


        script {
            result = sh (script: "git log -1 | grep '.*Jenkins version bump.*'", returnStatus: true)
            if (result == 0) {
                echo ("'Version bump' spotted in git commit. Aborting.")
                env.shouldBuild = "false"
            }
          }

                      script {
                          def causes = currentBuild.rawBuild.getCauses()
                          for(cause in causes) {
                              if (cause.class.toString().contains("UpstreamCause")) {
                                        env.shouldBuild = "true"

                                  println "This job was caused by job " + cause.upstreamProject
                              } else {
                                  println "Root cause : " + cause.toString()
                              }
                          }
                      }

        }
        }
        stage('Build, bump version') {
            when {
                branch 'master'
                expression {
                    return env.shouldBuild != "false"
                }

            }
          steps {
          withCredentials(bindings: [usernamePassword(credentialsId: "docker", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                              sshagent(credentials: ["${gitCredentials}"]){
                                sh '''
                                    MANAGED_VERSION=$(npm version patch -m "Jenkins version bump")
                                    git add .
                                    git commit -m "Jenkins version bump" | true
                                    git push origin master
                                    git push origin --tags
                                    docker login --username=$DOCKER_USERNAME --password=$DOCKER_PASSWORD
                                    docker build -t servicebot/servicebot-example:$MANAGED_VERSION .
                                    docker push servicebot/servicebot-example:$MANAGED_VERSION
                                '''


                                }
              }

          }
        }
  }
}