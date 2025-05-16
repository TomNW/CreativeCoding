AFRAME.registerComponent('orbit-stars', {
    schema: {
      count: {type: 'int', default: 30},
      radius: {type: 'number', default: 2},
      speed: {type: 'number', default: 0.5}
    },
    init: function () {
      this.stars = [];
      for(let i = 0; i < this.data.count; i++) {
        const star = document.createElement('a-sphere');
        star.setAttribute('radius', 0.02);
        star.setAttribute('color', '#FFF');
        star.setAttribute('emissive', '#FFF');
        star.setAttribute('emissiveIntensity', 1);
        star.setAttribute('material', 'shader: standard; emissive: white; emissiveIntensity: 1');
        this.el.appendChild(star);
        this.stars.push(star);
  
        // Random initial angle for each star
        star.initialAngle = Math.random() * Math.PI * 2;
        star.orbitRadius = this.data.radius * (0.7 + Math.random() * 0.6);
        star.orbitSpeed = this.data.speed * (0.5 + Math.random());
        star.orbitHeight = (Math.random() - 0.5) * 0.5; // slight vertical offset
      }
    },
    tick: function (time, deltaTime) {
      this.stars.forEach(star => {
        // Calculate new position along circular orbit
        star.initialAngle += star.orbitSpeed * deltaTime / 1000;
        const x = Math.cos(star.initialAngle) * star.orbitRadius;
        const z = Math.sin(star.initialAngle) * star.orbitRadius;
        const y = star.orbitHeight;
        star.setAttribute('position', `${x} ${y} ${z}`);
      });
    }
  });