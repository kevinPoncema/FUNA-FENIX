<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Feedback>
 */
class FeedbackFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Feedback::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['achievements', 'qualities', 'potential'];
        $category = fake()->randomElement($categories);

        return [
            'target_id' => TeamMember::factory(),
            'owner_id' => User::factory(),
            'category' => $category,
            'title' => $this->getTitleByCategory($category),
            'text' => $this->getTextByCategory($category),
        ];
    }

    /**
     * Generate title based on category
     */
    private function getTitleByCategory(string $category): string
    {
        $titles = [
            'achievements' => [
                'Excelente trabajo en el proyecto',
                'Superó las expectativas',
                'Liderazgo excepcional',
                'Resolución creativa de problemas',
                'Entrega antes del plazo',
                'Colaboración destacada',
                'Innovación en el proceso',
                'Resultado extraordinario',
                'Eficiencia impresionante',
                'Comunicación efectiva',
                'Iniciativa proactiva',
                'Adaptabilidad sobresaliente'
            ],
            'qualities' => [
                'Muy responsable y confiable',
                'Excelente comunicador',
                'Persona muy empática',
                'Líder natural nato',
                'Muy organizado y meticuloso',
                'Siempre positivo y motivador',
                'Muy creativo e innovador',
                'Extremadamente colaborativo',
                'Muy paciente y comprensivo',
                'Honesto y transparente',
                'Muy dedicado y comprometido',
                'Inspirador y carismático'
            ],
            'potential' => [
                'Gran potencial de liderazgo',
                'Puede desarrollar más habilidades técnicas',
                'Potencial para roles de gestión',
                'Capacidad de crecimiento en ventas',
                'Potencial en análisis de datos',
                'Puede liderar equipos grandes',
                'Potencial para ser mentor',
                'Capacidad de innovación',
                'Potencial internacional',
                'Puede especializarse en UX',
                'Potencial emprendedor',
                'Capacidad de comunicación pública'
            ]
        ];

        return fake()->randomElement($titles[$category]);
    }

    /**
     * Generate text content based on category
     */
    private function getTextByCategory(string $category): string
    {
        $texts = [
            'achievements' => [
                'Ha demostrado un rendimiento excepcional en todas las tareas asignadas, superando consistentemente las expectativas del equipo.',
                'Su trabajo en el último sprint fue fundamental para el éxito del proyecto, mostrando dedicación y atención al detalle.',
                'Logró completar todas las funcionalidades críticas antes del deadline, manteniendo alta calidad en el código.',
                'Su liderazgo durante la crisis del servidor ayudó a minimizar el impacto y restaurar el servicio rápidamente.',
                'Ha implementado mejoras que han optimizado el rendimiento del sistema en un 40%, un logro significativo.',
                'Su capacidad para resolver problemas complejos bajo presión ha sido clave para mantener la productividad del equipo.',
                'El feedback de los clientes sobre su trabajo ha sido consistentemente positivo, reflejando su profesionalismo.',
                'Ha mentorizado efectivamente a los nuevos miembros, acelerando su proceso de integración al equipo.',
                'Su innovación en el proceso de testing ha reducido los bugs en producción de manera considerable.',
                'Ha establecido nuevos estándares de calidad que han sido adoptados por todo el departamento.'
            ],
            'qualities' => [
                'Demuestra una actitud positiva constante que motiva a todo el equipo, incluso en momentos difíciles.',
                'Su capacidad de escucha activa y empatía hace que todos se sientan valorados y escuchados en las reuniones.',
                'Tiene una habilidad natural para mediar conflictos y encontrar soluciones que benefician a todas las partes.',
                'Su organización y planificación son ejemplares, siempre tiene todo bajo control y bien documentado.',
                'Es una persona muy confiable, siempre cumple sus compromisos y es honesto sobre los desafíos que enfrenta.',
                'Su creatividad aporta perspectivas frescas a los problemas, encontrando soluciones innovadoras y eficientes.',
                'Demuestra gran integridad en todas sus acciones, siendo un modelo a seguir para el resto del equipo.',
                'Su paciencia para explicar conceptos complejos hace que sea un excelente mentor y colaborador.',
                'Tiene una mentalidad de crecimiento que lo lleva a buscar constantemente nuevas formas de mejorar.',
                'Su comunicación clara y directa evita malentendidos y mantiene a todos alineados con los objetivos.'
            ],
            'potential' => [
                'Tiene todas las cualidades necesarias para asumir roles de liderazgo más amplios en la organización.',
                'Su capacidad analítica y visión estratégica lo posicionan bien para roles de gestión de producto.',
                'Con más experiencia en tecnologías cloud podría liderar la migración completa de nuestra infraestructura.',
                'Su habilidad para conectar con las personas lo hace ideal para roles que requieren gestión de stakeholders.',
                'Podría beneficiarse de capacitación formal en metodologías ágiles para maximizar su potencial como Scrum Master.',
                'Su creatividad y entendimiento del negocio lo posicionan bien para roles de innovación y desarrollo estratégico.',
                'Con formación adicional en data science podría liderar nuestros esfuerzos de análisis predictivo.',
                'Su capacidad de comunicación lo hace candidato ideal para representar al equipo técnico en presentaciones ejecutivas.',
                'Tiene potencial para especializarse en arquitectura de software y guiar las decisiones técnicas de alto nivel.',
                'Su comprensión del usuario final lo hace candidato perfecto para liderar iniciativas de experiencia de usuario.'
            ]
        ];

        return fake()->randomElement($texts[$category]);
    }

    /**
     * Indicate that the feedback is for achievements category
     */
    public function achievements(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'achievements',
            'title' => $this->getTitleByCategory('achievements'),
            'text' => $this->getTextByCategory('achievements'),
        ]);
    }

    /**
     * Indicate that the feedback is for qualities category
     */
    public function qualities(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'qualities',
            'title' => $this->getTitleByCategory('qualities'),
            'text' => $this->getTextByCategory('qualities'),
        ]);
    }

    /**
     * Indicate that the feedback is for potential category
     */
    public function potential(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'potential',
            'title' => $this->getTitleByCategory('potential'),
            'text' => $this->getTextByCategory('potential'),
        ]);
    }
}
